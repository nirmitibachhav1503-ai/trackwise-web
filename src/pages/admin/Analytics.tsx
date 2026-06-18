import { useState } from "react";
import * as XLSX from "xlsx";
import reportService from "../../services/reportService";
import { showError } from "../../utils/toast";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// Count working days in a month: exclude Sundays and 1st & 3rd Saturdays
const getWorkingDays = (month: number, year: number): number => {
  const lastDay = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    if (dow === 0) continue; // Sunday
    if (dow === 6) {
      const firstDay = new Date(year, month - 1, 1).getDay();
      const firstSatDate = 1 + (6 - firstDay + 7) % 7;
      const nthSat = Math.floor((d - firstSatDate) / 7) + 1;
      if (nthSat === 1 || nthSat === 3) continue; // 1st & 3rd Saturday
    }
    count++;
  }
  return count;
};

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

function Analytics() {
  const today = new Date();
  const [month, setMonth]     = useState(today.getMonth() + 1);
  const [year, setYear]       = useState(today.getFullYear());
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const getDateRange = () => {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { start, end };
  };

  const searchReport = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      const response = await reportService.getEmployeeAnalytics(start, end);
      setReports(Array.isArray(response.data) ? response.data : response.data ? [response.data] : []);
      setSelected(new Set());
    } catch {
      showError("Unable To Load Analytics");
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r =>
    (r.employeeName || "").toLowerCase().includes(search.toLowerCase())
  );

  const requiredMins = getWorkingDays(month, year) * 9 * 60;
  const requiredHHMM = toHHMM(requiredMins);

  const computeExtra = (actualHours: string): string => {
    const actual = toMinutes(actualHours);
    return toHHMM(actual - requiredMins);
  };

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    const names = filtered.map(r => r.employeeName);
    const allSelected = names.every(n => selected.has(n));
    setSelected(allSelected ? new Set() : new Set(names));
  };

  const exportExcel = () => {
    const toExport = selected.size > 0
      ? filtered.filter(r => selected.has(r.employeeName))
      : filtered;

    const headers = ["Employee Name", "Total Hours", "Required Hours", "Extra Hours", "Total Leave", "Total Half Day"];
    const sheetData: any[][] = [headers];
    toExport.forEach(r => {
      sheetData.push([
        r.employeeName,
        r.actualHours ?? "-",
        requiredHHMM,
        computeExtra(r.actualHours),
        r.totalLeaves ?? 0,
        r.totalHalfDays ?? 0,
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const { start, end } = getDateRange();
    a.download = `analytics-${start}-${end}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.employeeName));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Analytics</h4>
          <small className="text-muted">Employee hours summary by month</small>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Month</label>
              <select className="form-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold">Year</label>
              <input
                type="number"
                className="form-control"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              />
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

      {/* Search */}
      {reports.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: "320px" }}
          />
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead style={{ background: "#f4f6f9" }}>
                <tr>
                  <th className="px-4 py-3" style={{ width: "50px" }}>
                    <input
                      type="checkbox"
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-4 py-3">Total Hours</th>
                  <th className="px-4 py-3">Required Hours</th>
                  <th className="px-4 py-3">Extra Hours</th>
                  <th className="px-4 py-3">Total Leaves</th>
                  <th className="px-4 py-3">Total Half Days</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        checked={selected.has(r.employeeName)}
                        onChange={(e) => { e.stopPropagation(); toggleSelect(r.employeeName); }}
                      />
                    </td>
                    <td className="px-4 py-3">{r.employeeName}</td>
                    <td className="px-4 py-3">{r.actualHours ?? "-"}</td>
                    <td className="px-4 py-3">{requiredHHMM}</td>
                    <td className="px-4 py-3">
                      {r.actualHours
                        ? <span style={{ color: toMinutes(r.actualHours) >= requiredMins ? "green" : "red", fontWeight: 600 }}>
                            {computeExtra(r.actualHours)}
                          </span>
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{r.totalLeaves ?? 0}</td>
                    <td className="px-4 py-3">{r.totalHalfDays ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="alert alert-info">Select a month and year, then click Search.</div>
      )}
    </div>
  );
}

export default Analytics;
