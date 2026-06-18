import { useState } from "react";
import DatePicker from "../../components/common/DatePicker";
import reportService from "../../services/reportService";
import { showError } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";

function WeeklyReport() {
  const { user } = useAuth();
  const storedUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!startDate || !endDate) {
      showError("Please select both start and end dates");
      return;
    }
    try {
      setLoading(true);
      const response = await reportService.getWeeklyReport(startDate, endDate, storedUser?.userId);
      console.log("Weekly report response:", response.data);
      setData(response.data);
    } catch (err: any) {
      console.error("Weekly report error:", err?.response?.status, err?.response?.data);
      showError("Unable to load weekly report");
    } finally {
      setLoading(false);
    }
  };

  const rows: any[] = Array.isArray(data) ? data : data ? [data] : [];

  const DAY_FIELDS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  const toMinutes = (hhmm: string): number => {
    if (!hhmm || !hhmm.includes(":")) return 0;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const toHHMM = (mins: number): string => {
    const sign = mins < 0 ? "-" : "";
    const abs = Math.abs(mins);
    return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  };

  const parseDateFromMinutes = (val: string | null): Date | null => {
    if (!val) return null;
    const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!match) return null;
    const d = new Date(match[1]);
    return isNaN(d.getTime()) ? null : d;
  };

  const parseTimeFromMinutes = (val: string | null): string | null => {
    if (!val) return null;
    const match = val.match(/\((\d{2}:\d{2})\)/);
    return match ? match[1] : null;
  };

  const isLeaveSaturday = (d: Date): boolean => {
    if (d.getDay() !== 6) return false;
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    const firstSatDate = 1 + (6 - firstDay + 7) % 7;
    const nthSaturday = Math.floor((d.getDate() - firstSatDate) / 7) + 1;
    return nthSaturday === 1 || nthSaturday === 3;
  };

  const groupRowsByWeek = () => {
    return rows.map(row => {
      const days: { date: Date | null; field: string; label: string }[] = [];
      DAY_FIELDS.forEach((field, i) => {
        const minutesKey = field + "Minutes";
        if (row[minutesKey] === undefined) return;
        const dateVal = parseDateFromMinutes(row[minutesKey]);
        if (field === "saturday" && dateVal === null) {
          const knownDay = DAY_FIELDS.slice(0, 5)
            .map((f, fi) => ({ f, fi, d: parseDateFromMinutes(row[f + "Minutes"]) }))
            .find(x => x.d !== null);
          if (knownDay?.d) {
            const sat = new Date(knownDay.d);
            sat.setDate(sat.getDate() + (6 - sat.getDay() + 7) % 7 || 7);
            if (isLeaveSaturday(sat)) return;
          }
          return;
        }
        if (field === "saturday" && dateVal && isLeaveSaturday(dateVal)) return;
        days.push({ date: dateVal, field, label: DAY_LABELS[i] });
      });
      return { days, row };
    });
  };

  const weekGroups = groupRowsByWeek();

  const exportExcel = () => {
    const sheetData: any[][] = [];
    weekGroups.forEach(group => {
      const firstDate = group.days.find(d => d.date)?.date;
      const lastDate = [...group.days].reverse().find(d => d.date)?.date;
      sheetData.push([`Week: ${firstDate ? formatDate(firstDate) : "-"} – ${lastDate ? formatDate(lastDate) : "-"}`]);
      sheetData.push([
        ...group.days.map(({ date, label }) => `${label}${date ? ` (${formatDate(date)})` : ""}`),
        "Total Hours", "Actual Hours", "Extra Hours"
      ]);
      const dataRow: any[] = group.days.map(({ field }) => {
        const val = group.row?.[field];
        const mins = toMinutes(val);
        if (!val || mins === 0) return "Leave";
        const time = parseTimeFromMinutes(group.row?.[field + "Minutes"]) ?? val;
        return mins < 6 * 60 ? `${time} (Half Day)` : time;
      });
      dataRow.push(
        group.row?.totalWorkingHours || "-",
        toHHMM(group.days.length * 9 * 60),
        group.row?.totalWorkingHours ? toHHMM(toMinutes(group.row.totalWorkingHours) - group.days.length * 9 * 60) : "-"
      );
      sheetData.push(dataRow);
      sheetData.push([]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Weekly Report");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-report-${startDate}-${endDate}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Weekly Report</h4>
          <small className="text-muted">Select a date range to view your report</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Start Date</label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">End Date</label>
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={search} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : "Search"}
              </button>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-success w-100"
                onClick={exportExcel}
                disabled={!weekGroups.length}
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

     

      {weekGroups.length > 0 ? (
        weekGroups.map((group, groupIndex) => {
          const firstDate = group.days.find(d => d.date)?.date;
          const lastDate = [...group.days].reverse().find(d => d.date)?.date;
          return (
            <div className="card border-0 shadow-sm mb-4" key={groupIndex} style={{ borderRadius: "12px" }}>
              <div className="card-header fw-semibold py-3 px-4" style={{ background: "#f4f6f9" }}>
                Week: {firstDate ? formatDate(firstDate) : "-"} – {lastDate ? formatDate(lastDate) : "-"}
              </div>
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      {group.days.map(({ date, field, label }) => (
                        <th key={field} className="px-4 py-3">{label} {date ? `(${formatDate(date)})` : ""}</th>
                      ))}
                      <th className="px-4 py-3">Total Hours</th>
                      <th className="px-4 py-3">Actual Hours</th>
                      <th className="px-4 py-3">Extra Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {group.days.map(({ field }) => {
                        const val = group.row?.[field];
                        const mins = toMinutes(val);
                        const isLeave = !val || mins === 0;
                        const isHalfDay = !isLeave && mins < 6 * 60;
                        return (
                          <td key={field} className="px-4 py-3">
                            {isLeave ? (
                              <span style={{ color: "#dc3545", fontWeight: 600 }}>Leave</span>
                            ) : (
                              <>
                                {parseTimeFromMinutes(group.row?.[field + "Minutes"]) ?? val}
                                {isHalfDay && (
                                  <>
                                    <br />
                                    <span style={{ color: "#ffc107", fontWeight: 600 }}>
                                      Half Day
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">{group.row?.totalWorkingHours || "-"}</td>
                      <td className="px-4 py-3">{toHHMM(group.days.length * 9 * 60)}</td>
                      <td className="px-4 py-3">{group.row?.totalWorkingHours ? toHHMM(toMinutes(group.row.totalWorkingHours) - group.days.length * 9 * 60) : "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      ) : !loading && data !== null ? (
        <div className="alert alert-info">No report data found for the selected date range.</div>
      ) : null}
    </div>
  );
}

export default WeeklyReport;
