import { useState } from "react";
import * as XLSX from "xlsx";
import DatePicker from "../../components/common/DatePicker";
import reportService from "../../services/reportService";
import holidayService from "../../services/holidayService";
import { showError } from "../../utils/toast";

interface DayCol {
  date: Date | null;
  field: string;
  label: string;
  isHoliday: boolean;
}

interface WeekGroup {
  days: DayCol[];
  row: any;
}

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

const getDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getApiDateKey = (val: string | null): string => val ? val.slice(0, 10) : "";

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

const buildWeekGroups = (startDate: string, endDate: string, rows: any[], holidayDates: Set<string>): WeekGroup[] => {
  if (!startDate || !endDate) return [];

  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  const dayFields = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isDateWorking = (date: Date): boolean => {
    if (date.getDay() === 0) return false;
    if (date.getDay() === 6) {
      const weekOfMonth = Math.ceil(date.getDate() / 7);
      if (weekOfMonth === 1 || weekOfMonth === 3) return false;
    }
    return true;
  };

  const rowMap = new Map<string, any[]>();
  rows.forEach(r => {
    const name = r.employeeName || r.fullName || "Unknown";
    if (!rowMap.has(name)) rowMap.set(name, []);
    (rowMap.get(name)!).push(r);
  });

  const getRowForWeek = (empName: string, weekStart: Date): any => {
    const weekKey = getDateKey(weekStart);
    const empRows = rowMap.get(empName);
    if (!empRows) return buildSyntheticRow(empName, weekStart);
    const found = empRows.find((r: any) => {
      const d = parseDateFromMinutes(r.mondayMinutes);
      return d && getDateKey(d) === weekKey;
    });
    if (found) return found;
    return buildSyntheticRow(empName, weekStart);
  };

  const buildSyntheticRow = (empName: string, weekStart: Date): any => {
    const row: any = { employeeName: empName, _synthetic: true };
    for (let i = 0; i < 6; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const field = dayFields[i];
      if (holidayDates.has(getDateKey(date))) {
        row[field] = "Holiday";
        row[field + "Minutes"] = null;
      } else if (isDateWorking(date)) {
        row[field] = "Leave";
        row[field + "Minutes"] = null;
      } else {
        row[field] = null;
        row[field + "Minutes"] = null;
      }
    }
    row.totalWorkingHours = null;
    row.totalMinutes = 0;
    row.actualHours = null;
    row.extraHours = null;
    return row;
  };

  const groups: WeekGroup[] = [];
  const cursor = new Date(start);
  const initialMonday = new Date(start);
  initialMonday.setDate(initialMonday.getDate() - ((initialMonday.getDay() + 6) % 7));
  cursor.setTime(initialMonday.getTime());

  while (cursor.getTime() <= end.getTime()) {
    const weekStart = new Date(cursor);

    const allNames = new Set<string>();
    rows.forEach(r => allNames.add(r.employeeName || r.fullName || "Unknown"));

    allNames.forEach(name => {
      const row = getRowForWeek(name, weekStart);
      const days: DayCol[] = [];

      for (let i = 0; i < 6; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);

        if (date < start || date > end) continue;
        const holiday = holidayDates.has(getDateKey(date));
        if (!holiday && !isDateWorking(date)) continue;

        const field = dayFields[i];
        const label = dayLabels[i];
        days.push({ date, field, label, isHoliday: holiday });
      }

      if (days.length > 0) {
        groups.push({ days, row });
      }
    });

    cursor.setDate(cursor.getDate() + 7);
  }

  return groups;
};

function WeeklyReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [reports, setReports]     = useState<any[]>([]);
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize]       = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected]   = useState<Set<string>>(new Set());

  const [totalEmployees, setTotalEmployees] = useState(0);

  const fetchPage = async (pageNo: number, size: number) => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      const year = Number(startDate.slice(0, 4));
      const [response, holidaysResponse] = await Promise.all([
        reportService.getWeeklyReport(startDate, endDate, undefined, pageNo, size),
        holidayService.getHolidays(year)
      ]);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data ? [response.data] : [];
      const holidays = Array.isArray(holidaysResponse.data) ? holidaysResponse.data : [];
      setHolidayDates(new Set(holidays.map((h: any) => getApiDateKey(h.holidayDate))));
      setTotalEmployees(data[0]?.totalCount ?? 0);
      setReports(data);
      setSelected(new Set());
    } catch {
      showError("Unable To Load Weekly Report");
    } finally {
      setLoading(false);
    }
  };

  const searchReport = async () => {
    await fetchPage(1, pageSize);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchPage(page, pageSize);
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

    toExport.forEach(([name, rows]: [string, any[]]) => {
      const groups = buildWeekGroups(startDate, endDate, rows, holidayDates);
      sheetData.push([name]);
      groups.forEach(group => {
        const firstDate = group.days.find((d: DayCol) => d.date)?.date;
        const lastDate = [...group.days].reverse().find((d: DayCol) => d.date)?.date;
        sheetData.push(["Week: " + (firstDate ? formatDate(firstDate) : "-") + " - " + (lastDate ? formatDate(lastDate) : "-")]);
        sheetData.push([
          ...group.days.map(({ date, label }: DayCol) => label + (date ? " (" + formatDate(date) + ")" : "")),
          "Total Hours", "Actual Hours", "Extra Hours"
        ]);
        const dataRow: any[] = group.days.map(({ field, isHoliday }: DayCol) => {
          if (isHoliday) return "Holiday";
          const val = group.row?.[field];
          const mins = toMinutes(val);
          if (!val || mins === 0) return "Leave";
          const time = parseTimeFromMinutes(group.row?.[field + "Minutes"]) ?? val;
          return mins < 6 * 60 ? `${time} (Half Day)` : time;
        });
        const requiredMinutes = group.days.filter((d: DayCol) => !d.isHoliday).length * 9 * 60;
        dataRow.push(
          group.row?.totalWorkingHours || "-",
          toHHMM(requiredMinutes),
          group.row?.totalWorkingHours ? toHHMM(toMinutes(group.row.totalWorkingHours) - requiredMinutes) : "-"
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

  const paginatedNames = employeeNames;

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
                {loading ? <span className="spinner-border spinner-border-sm" /> : " Search"}
              </button>
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={exportExcel} disabled={!reports.length}>
                 {selected.size > 0 ? `${selected.size} Export` : "Export Excel"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {totalEmployees > 0 && (
        <div className="row g-3 mb-4">
          {[
            { title: "Total Employees", value: totalEmployees, icon: "👥", color: "#4361ee" },
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
            onChange={e => setSearch(e.target.value)}
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
      {paginatedNames.map(name => {
        const weekGroups = buildWeekGroups(startDate, endDate, grouped[name], holidayDates);
        return (
          <>
            {/* Employee header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  checked={selected.has(name)}
                  onChange={(e) => { e.stopPropagation(); toggleSelect(name); }}
                />
                <h6 className="fw-bold mb-0">👤 {name}</h6>
              </div>
            </div>

            {weekGroups.map((group: WeekGroup, groupIndex: number) => {
              const firstDate = group.days.find((d: DayCol) => d.date)?.date;
              const lastDate = [...group.days].reverse().find((d: DayCol) => d.date)?.date;
              return (
                <div className="card border-0 shadow-sm mb-4" key={groupIndex} style={{ borderRadius: "12px" }}>
                  <div className="card-header fw-semibold py-3 px-4" style={{ background: "#f4f6f9" }}>
                    Week: {firstDate ? formatDate(firstDate) : "-"} - {lastDate ? formatDate(lastDate) : "-"}
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          {group.days.map(({ date, field, label }: DayCol) => (
                            <th key={field} className="px-4 py-3">{label} {date ? `(${formatDate(date)})` : ""}</th>
                          ))}
                          <th className="px-4 py-3">Total Hours</th>
                          <th className="px-4 py-3">Actual Hours</th>
                          <th className="px-4 py-3">Extra Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {group.days.map(({ field, isHoliday }: DayCol) => {
                            const val = group.row?.[field];
                            const mins = toMinutes(val);
                            const isLeave   = !val || mins === 0;
                            const isHalfDay = !isLeave && mins < 6 * 60;
                            return (
                              <td key={field} className="px-4 py-3">
                                {isHoliday ? (
                                  <span style={{ color: "#0d6efd", fontWeight: 600 }}>Holiday</span>
                                ) : isLeave ? (
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
                          <td className="px-4 py-3">{toHHMM(group.days.filter((d: DayCol) => !d.isHoliday).length * 9 * 60)}</td>
                          <td className="px-4 py-3">
                            {group.row?.totalWorkingHours
                              ? toHHMM(toMinutes(group.row.totalWorkingHours) - group.days.filter((d: DayCol) => !d.isHoliday).length * 9 * 60)
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </>
        );
      })}

      {/* Bottom pagination */}
      {paginatedNames.length > 0 && (
        <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={pageSize}
              onChange={e => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setCurrentPage(1);
                fetchPage(1, newSize);
              }}
            >
              {[1, 5, 10, 25].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage - 1)}>‹</button>
              </li>
              {Array.from({ length: Math.max(1, Math.ceil(totalEmployees / pageSize)) }, (_, i) => i + 1).map(p => (
                <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === Math.max(1, Math.ceil(totalEmployees / pageSize)) ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(currentPage + 1)}>›</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {!loading && reports.length === 0 && startDate && endDate && (
        <div className="alert alert-info">No report data found for the selected date range.</div>
      )}
    </div>
  );
}

export default WeeklyReport;
