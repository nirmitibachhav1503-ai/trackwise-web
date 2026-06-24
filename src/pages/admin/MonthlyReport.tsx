import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import type { GridColDef } from "@mui/x-data-grid/models";
import AppDataGrid from "../../components/common/AppDataGrid";
import reportService from "../../services/reportService";
import holidayService from "../../services/holidayService";
import { showError } from "../../utils/toast";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

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

const isWorkingDay = (date: Date): boolean => {
  if (date.getDay() === 0) return false;
  if (date.getDay() === 6) {
    const weekOfMonth = Math.ceil(date.getDate() / 7);
    if (weekOfMonth === 1 || weekOfMonth === 3) return false;
  }
  return true;
};

const getApiDateKey = (val: string | null): string => val ? val.slice(0, 10) : "";

const columns: GridColDef[] = [
  { field: "employeeName",     headerName: "Employee",    flex: 1.5 },
  { field: "week1",            headerName: "Week 1",      flex: 1 },
  { field: "week2",            headerName: "Week 2",      flex: 1 },
  { field: "week3",            headerName: "Week 3",      flex: 1 },
  { field: "week4",            headerName: "Week 4",      flex: 1 },
  { field: "week5",            headerName: "Week 5",      flex: 1 },
  { field: "totalWorkingHours",headerName: "Total Hours", flex: 1.2 },
  { field: "requiredHours",    headerName: "Required",    flex: 1.2 },
  { field: "extraHours",       headerName: "Extra Hours", flex: 1.2 },
];

function MonthlyReport() {
  const today = new Date();
  const [month, setMonth]     = useState(today.getMonth() + 1);
  const [year, setYear]       = useState(today.getFullYear());
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize]       = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    if (reports.length > 0) searchReport();
  }, [currentPage, pageSize]);

  const searchReport = async () => {
    try {
      setLoading(true);
      const [response, holidaysResponse] = await Promise.all([
        reportService.getMonthlyReport(
          month,
          year,
          undefined,
          currentPage,
          pageSize
        ),
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
      showError("Unable To Load Monthly Report");
    } finally {
      setLoading(false);
    }
  };

  const monthlyHolidayCount = Array.from(holidayDates).filter(dateKey => {
    const date = new Date(dateKey + "T00:00:00");
    return date.getFullYear() === year && date.getMonth() + 1 === month && isWorkingDay(date);
  }).length;

  const adjustedReports = reports.map(r => {
    const requiredMinutes = Math.max(0, toMinutes(r.requiredHours) - monthlyHolidayCount * 9 * 60);
    const totalMinutes = toMinutes(r.totalWorkingHours);
    return {
      ...r,
      requiredHours: toHHMM(requiredMinutes),
      extraHours: toHHMM(totalMinutes - requiredMinutes),
    };
  });

  const filteredReports = adjustedReports.filter(x =>
    x.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    const names = filteredReports.map(r => r.employeeName);
    const allSelected = names.every(n => selected.has(n));
    setSelected(allSelected ? new Set() : new Set(names));
  };

  const exportExcel = () => {
    const toExport = selected.size > 0
      ? filteredReports.filter(r => selected.has(r.employeeName))
      : filteredReports;

    const headers = ["Employee", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Total Hours", "Required", "Extra Hours"];
    const sheetData: any[][] = [headers];
    toExport.forEach(r => {
      sheetData.push([r.employeeName, r.week1, r.week2, r.week3, r.week4, r.week5, r.totalWorkingHours, r.requiredHours, r.extraHours]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-report-${year}-${month}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Monthly Report</h4>
          <small className="text-muted">Employee hours breakdown by month</small>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Month</label>
              <select className="form-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
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

      {/* Summary Cards */}
      {filteredReports.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { title: "Total Employees",  value: filteredReports.length, icon: "👥", color: "#4361ee" },
            { title: "Monthly Records",  value: filteredReports.length, icon: "📈", color: "#2ec4b6" },
            { title: "Hours Tracked",    value: filteredReports.length, icon: "🕐", color: "#f4a261" },
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

      {/* Search + Grid */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="mb-3 d-flex align-items-center gap-3">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: "320px" }}
            />
          </div>
          <AppDataGrid
            rows={filteredReports.map((r, i) => ({ id: i, ...r }))}
            columns={[
              { field: "select", headerName: "", width: 60, sortable: false, disableColumnMenu: true,
                renderHeader: () => (
                  <input
                    type="checkbox"
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    checked={filteredReports.length > 0 && filteredReports.every(r => selected.has(r.employeeName))}
                    onChange={toggleAll}
                  />
                ),
                renderCell: (params: any) => (
                  <input
                    type="checkbox"
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    checked={selected.has(params.row.employeeName)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(params.row.employeeName); }}
                  />
                )
              },
              ...columns,
            ]}
            loading={loading}
            hideFooterPagination={true}
          />

          {filteredReports.length > 0 && (
            <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
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
                    <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
                  </li>
                  {Array.from({ length: Math.max(1, Math.ceil(totalEmployees / pageSize)) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === Math.max(1, Math.ceil(totalEmployees / pageSize)) ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(p => Math.min(Math.max(1, Math.ceil(totalEmployees / pageSize)), p + 1))}>›</button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonthlyReport;
