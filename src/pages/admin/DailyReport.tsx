import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import type { GridColDef } from "@mui/x-data-grid/models";
import AppDataGrid from "../../components/common/AppDataGrid";
import DatePicker from "../../components/common/DatePicker";
import reportService from "../../services/reportService";
import { showError } from "../../utils/toast";

const formatTime = (val: string | null) =>
  val ? new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "--";

const formatDate = (val: string | null) =>
  val ? new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "--";

const parseWorkingHours = (val: any): number => {
  if (val == null || val === "") return 0;
  const str = String(val).trim();
  if (str.includes(":")) {
    const [h, m, s = "0"] = str.split(":");
    return parseInt(h) + parseInt(m) / 60 + parseInt(s) / 3600;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

const formatHoursToHMM = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${String(m).padStart(2, "0")}`;
};

function DailyReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [reports, setReports]     = useState<any[]>([]);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [pageSize, setPageSize]       = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (isAdmin && reports.length > 0) searchReport();
  }, [currentPage, pageSize]);

  const columns: GridColDef[] = useMemo(() => [
    { field: "reportDate",    headerName: "Date",           flex: 1,   valueFormatter: (val) => formatDate(val) },
    { field: "inTime",        headerName: "In Time",        flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "lunchout",      headerName: "Lunch Start",    flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "lunchin",       headerName: "Lunch End",      flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "breakOut",      headerName: "Break Start",    flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "breakIn",       headerName: "Break End",      flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "outTime",       headerName: "Out Time",       flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "workingHours",  headerName: "Working Hours",  flex: 1 },
    { field: "requiredHours", headerName: "Required Hours", flex: 1,   valueGetter: () => 9 },
    { field: "extraHours",    headerName: "Extra Hours",    flex: 1,
      renderCell: (params: any) => {
        const working = parseWorkingHours(params.row.workingHours);
        const result = working - 9;
        const formatted = formatHoursToHMM(Math.abs(result));
        const sign = result >= 0 ? "" : "-";
        return <span style={{ color: result >= 0 ? "green" : "red" }}>{sign}{formatted}</span>;
      }
    },
    { field: "remarks", headerName: "Remarks", flex: 1.2,
      renderCell: (params: any) => {
        const working = parseWorkingHours(params.row.workingHours);
        if (working === 0) return <span style={{ color: "red",    fontWeight: 600 }}>Leave</span>;
        if (working < 6)   return <span style={{ color: "orange", fontWeight: 600 }}>Half Day</span>;
        return "";
      }
    },
  ], []);

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

  const searchReport = async () => {
    if (!startDate || !endDate) { showError("Please select both start and end dates"); return; }
    try {
      setLoading(true);
      const response = await reportService.getDailyRangeReport(
        startDate, endDate,
        isAdmin ? currentPage : undefined,
        isAdmin ? pageSize : undefined
      );
      const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
      setTotalEmployees(data[0]?.totalCount ?? 0);
      setReports(data);
      setSelected(new Set());
      if (!isAdmin) setCurrentPage(1);
    } catch {
      showError("Unable To Load Report");
    } finally {
      setLoading(false);
    }
  };

  // Group by fullName
  const grouped: Record<string, any[]> = {};
  reports.forEach(r => {
    const name = r.fullName || "Unknown";
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(r);
  });

  const employeeNames = Object.keys(grouped).filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = isAdmin
    ? Math.max(1, Math.ceil(totalEmployees / pageSize))
    : Math.max(1, Math.ceil(employeeNames.length / pageSize));
  const pagedNames = isAdmin
    ? employeeNames
    : employeeNames.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPresent = reports.filter(r => parseWorkingHours(r.workingHours) > 0).length;
  const totalAbsent  = reports.filter(r => parseWorkingHours(r.workingHours) === 0).length;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const sheetData: any[][] = [];
    const headers = ["Date", "In Time", "Lunch Start", "Lunch End", "Break Start", "Break End", "Out Time", "Working Hours", "Required Hours", "Extra Hours", "Remarks"];
    const toExport = selected.size > 0
      ? Object.entries(grouped).filter(([name]) => selected.has(name))
      : Object.entries(grouped);

    toExport.forEach(([name, rows]) => {
      sheetData.push([name]);
      sheetData.push(headers);
      rows.forEach(r => {
        const working = parseWorkingHours(r.workingHours);
        const extra   = working - 9;
        sheetData.push([
          formatDate(r.reportDate),
          formatTime(r.inTime),
          formatTime(r.lunchout),
          formatTime(r.lunchin),
          formatTime(r.breakOut),
          formatTime(r.breakIn),
          formatTime(r.outTime),
          r.workingHours || "--",
          "09:00",
          (extra >= 0 ? "" : "-") + formatHoursToHMM(Math.abs(extra)),
          working === 0 ? "Leave" : working < 6 ? "Half Day" : "",
        ]);
      });
      sheetData.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-report-${startDate}-${endDate}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <style>{`
        .leave-row { background-color: #ffcccc !important; }
        .leave-row:hover { background-color: #ffb3b3 !important; }
        .halfday-row { background-color: #fff3cd !important; }
        .halfday-row:hover { background-color: #ffe69c !important; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Daily Report</h4>
          <small className="text-muted">Employee attendance by date range</small>
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
      

      {/* Search */}
      {reports.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search employee..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ maxWidth: "320px" }}
          />
        </div>
      )}

      {/* Per-employee grids */}
      {employeeNames.length > 0 && (
        <div className="mb-2 d-flex align-items-center gap-2">
          <input
            type="checkbox"
            id="select-all"
            style={{ cursor: "pointer", width: "16px", height: "16px" }}
            checked={employeeNames.length > 0 && employeeNames.every(n => selected.has(n))}
            onChange={() => toggleAll(employeeNames)}
          />
          <label htmlFor="select-all" className="mb-0 text-muted small" style={{ cursor: "pointer" }}>Select All</label>
        </div>
      )}
      {pagedNames.map(name => (
        <div className="card border-0 shadow-sm mb-4" key={name} style={{ borderRadius: "12px" }}>
          <div className="card-header fw-semibold py-3 px-4 d-flex align-items-center gap-2" style={{ background: "#f4f6f9" }}>
            <input
              type="checkbox"
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
              checked={selected.has(name)}
              onChange={(e) => { e.stopPropagation(); toggleSelect(name); }}
            />
            👤 {name}
          </div>
          <div className="card-body p-0">
            <AppDataGrid
              rows={grouped[name].map((r, i) => ({ id: i, ...r }))}
              columns={columns}
              loading={false}
              getRowClassName={(params: any) => {
                const working = parseWorkingHours(params.row.workingHours);
                if (working === 0) return "leave-row";
                if (working < 6)   return "halfday-row";
                return "";
              }}
            />
          </div>
        </div>
      ))}

      {/* Pagination */}
      {employeeNames.length > 0 && (
        <div className="d-flex align-items-center justify-content-between mt-2 mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[1, 5, 10, 25].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>‹</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>›</button>
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

export default DailyReport;
