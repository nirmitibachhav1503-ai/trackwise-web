import { useState } from "react";
import * as XLSX from "xlsx";
import DatePicker from "../../components/common/DatePicker";
import reportService from "../../services/reportService";
import { showError } from "../../utils/toast";

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

// Extract date from "2026-06-15 (08:41)" => Date object
const parseDateFromMinutes = (val: string | null): Date | null => {
  if (!val) return null;
  const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  const d = new Date(match[1]);
  return isNaN(d.getTime()) ? null : d;
};

// Extract time part from "2026-06-15 (08:41)" => "08:41"
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

const buildWeekGroups = (_startDate: string, _endDate: string, rows: any[]) => {
  return rows.map(row => {
    const days: { date: Date | null; field: string; label: string }[] = [];
    DAY_FIELDS.forEach((field, i) => {
      const minutesKey = field + "Minutes";
      if (row[minutesKey] === undefined) return;
      const dateVal = parseDateFromMinutes(row[minutesKey]);
      // For null saturday, derive date from a known day in the row
      if (field === "saturday" && dateVal === null) {
        const knownDay = DAY_FIELDS.slice(0, 5)
          .map((f, fi) => ({ f, fi, d: parseDateFromMinutes(row[f + "Minutes"]) }))
          .find(x => x.d !== null);
        if (knownDay?.d) {
          const sat = new Date(knownDay.d);
          sat.setDate(sat.getDate() + (6 - sat.getDay() + 7) % 7 || 7);
          if (isLeaveSaturday(sat)) return; // skip — it's a holiday
        }
        return; // null saturday with no derivable date, skip
      }
      if (field === "saturday" && dateVal && isLeaveSaturday(dateVal)) return;
      days.push({ date: dateVal, field, label: DAY_LABELS[i] });
    });
    return { days, row };
  });
};

function WeeklyReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [reports, setReports]     = useState<any[]>([]);
  const [page, setPage]           = useState(0);
  const [selected, setSelected]   = useState<Set<string>>(new Set());

  const searchReport = async () => {
    if (!startDate || !endDate) { showError("Please select both start and end dates"); return; }
    try {
      setLoading(true);
      setPage(0);
      const response = await reportService.getWeeklyReport(startDate, endDate);
      setReports(Array.isArray(response.data) ? response.data : [response.data]);
      setSelected(new Set());
    } catch {
      showError("Unable To Load Weekly Report");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleAll = (names: string[]) => {
    const allSelected = names.every(n => selected.has(n));
    setSelected(allSelected ? new Set() : new Set(names));
  };

  const exportExcel = () => {
    const sheetData: any[][] = [];

    const toExport = selected.size > 0
      ? Object.entries(grouped).filter(([name]) => selected.has(name))
      : Object.entries(grouped);

    toExport.forEach(([name, rows]) => {
      const groups = buildWeekGroups(startDate, endDate, rows);
      sheetData.push([name]);
      groups.forEach(group => {
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

  // Group rows by employeeName
  const grouped: Record<string, any[]> = {};
  reports.forEach(r => {
    const name = r.employeeName || r.fullName || "Unknown";
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(r);
  });

  const employeeNames = Object.keys(grouped).filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages  = employeeNames.length;
  const currentName = employeeNames[page];
  const weekGroups  = currentName
    ? buildWeekGroups(startDate, endDate, grouped[currentName])
    : [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Weekly Report</h4>
          <small className="text-muted">Employee hours breakdown by week</small>
        </div>
      </div>

      {/* Filters */}
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
              <button className="btn btn-primary w-100" onClick={searchReport} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : "🔍 Search"}
              </button>
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={exportExcel} disabled={!reports.length}>
                📥 {selected.size > 0 ? `${selected.size} Export` : "Export Excel"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {employeeNames.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { title: "Total Employees", value: employeeNames.length, icon: "👥", color: "#4361ee" },
            { title: "Weekly Records",  value: reports.length,       icon: "📊", color: "#2ec4b6" },
            { title: "Hours Tracked",   value: reports.length,       icon: "🕐", color: "#f4a261" },
          ].map(card => (
            <div className="col-md-4" key={card.title}>
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                    style={{ width: "52px", height: "52px", background: card.color + "22", flexShrink: 0 }}>
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-muted small">{card.title}</div>
                    <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Select All */}
      {employeeNames.length > 0 && (
        <div className="mb-3 d-flex align-items-center gap-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search employee..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            style={{ maxWidth: "320px" }}
          />
          <div className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
              checked={employeeNames.length > 0 && employeeNames.every(n => selected.has(n))}
              onChange={() => toggleAll(employeeNames)}
            />
            <label htmlFor="select-all" className="mb-0 text-muted small" style={{ cursor: "pointer" }}>Select All</label>
          </div>
        </div>
      )}

      {/* Employee Week Tables */}
      {currentName && (
        <>
          {/* Employee header + pagination */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                style={{ cursor: "pointer", width: "16px", height: "16px" }}
                checked={selected.has(currentName)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(currentName); }}
              />
              <h6 className="fw-bold mb-0">👤 {currentName}</h6>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                ‹ Prev
              </button>
              <span className="text-muted small">Employee {page + 1} of {totalPages}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                Next ›
              </button>
            </div>
          </div>

          {weekGroups.map((group, groupIndex) => {
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
                          const isLeave   = !val || mins === 0;
                          const isHalfDay = !isLeave && mins < 6 * 60;
                          return (
                            <td key={field} className="px-4 py-3">
                              {isLeave ? (
                                <span style={{ color: "#dc3545", fontWeight: 600 }}>Leave</span>
                              ) : (
                                <>
                                  {parseTimeFromMinutes(group.row?.[field + "Minutes"]) ?? val}
                                  {isHalfDay && (
                                    <><br /><span style={{ color: "#ffc107", fontWeight: 600 }}>Half Day</span></>
                                  )}
                                </>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3">{group.row?.totalWorkingHours || "-"}</td>
                        <td className="px-4 py-3">{toHHMM(group.days.length * 9 * 60)}</td>
                        <td className="px-4 py-3">
                          {group.row?.totalWorkingHours
                            ? toHHMM(toMinutes(group.row.totalWorkingHours) - group.days.length * 9 * 60)
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Bottom pagination */}
          <div className="d-flex justify-content-center align-items-center gap-2 mt-2 mb-4">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              ‹ Prev
            </button>
            {employeeNames.map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${i === page ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              Next ›
            </button>
          </div>
        </>
      )}

      {!loading && reports.length === 0 && startDate && endDate && (
        <div className="alert alert-info">No report data found for the selected date range.</div>
      )}
    </div>
  );
}

export default WeeklyReport;
