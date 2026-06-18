import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import type { GridColDef } from "@mui/x-data-grid/models";
import AppDataGrid from "../../components/common/AppDataGrid";
import DatePicker from "../../components/common/DatePicker";
import reportService from "../../services/reportService";
import { showError } from "../../utils/toast";

const getTodayKey = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};

const formatTime = (val: string | null) =>
  val ? new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "--";

const formatDate = (val: string | null) =>
  val ? new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "--";

const parseWorkingHours = (val: any): number => {
  if (val == null || val === "") return 0;
  const str = String(val).trim();
  if (str.includes(":")) {
    const parts = str.split(":");
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const s = parseInt(parts[2]) || 0;
    return h + m / 60 + s / 3600;
  }
  if (str.includes(".")) {
    const parts = str.split(".");
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    return h + m / 60;
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
  const today = getTodayKey();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate]     = useState(today);
  const [loading, setLoading]     = useState(false);
  const [reports, setReports]     = useState<any[]>([]);

  const columns: GridColDef[] = useMemo(() => [
    { field: "reportDate",    headerName: "Date",           flex: 1, valueFormatter: (val) => formatDate(val) },
    { field: "inTime",        headerName: "In Time",        flex: 1, valueFormatter: (val) => formatTime(val) },
    { field: "lunchout",      headerName: "Lunch Start",    flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "lunchin",       headerName: "Lunch End",      flex: 1,   valueFormatter: (val) => formatTime(val) },
    { field: "breakOut",      headerName: "Break Start",    flex: 1, valueFormatter: (val) => formatTime(val) },
    { field: "breakIn",       headerName: "Break End",      flex: 1, valueFormatter: (val) => formatTime(val) },
    { field: "outTime",       headerName: "Out Time",       flex: 1, valueFormatter: (val) => formatTime(val) },      
    { field: "workingHours",  headerName: "Working Hours",  flex: 1 },
    { field: "requiredHours", headerName: "Required Hours", flex: 1, valueGetter: () => 9 },
    { field: "extraHours",    headerName: "Extra Hours",    flex: 1,
      renderCell: (params: any) => {
        const working = parseWorkingHours(params.row.workingHours);
        const result = working - 9;
        const formatted = formatHoursToHMM(Math.abs(result));
        const sign = result >= 0 ? "" : "-";
        return <span style={{ color: result >= 0 ? "green" : "red" }}>{sign}{formatted}</span>;
      }
    },
    { field: "remarks",       headerName: "Remarks",        flex: 1.5,
      renderCell: (params: any) => {
        const working = parseWorkingHours(params.row.workingHours);
        if (working === 0) return <span style={{ color: "red", fontWeight: 600 }}>Leave</span>;
        if (working < 6)   return <span style={{ color: "orange", fontWeight: 600 }}>Half Day</span>;
        return "";
      }
    },
  ], []);

  const exportExcel = () => {
    const data = reports.map(r => {
      const working = parseWorkingHours(r.workingHours);
      const extra   = working - 9;
      const sign    = extra >= 0 ? "" : "-";
      return {
        "Date":           formatDate(r.reportDate),
        "In Time":        formatTime(r.inTime),
        "Lunch Start":    formatTime(r.lunchout),
        "Lunch End":      formatTime(r.lunchin),
        "Break Start":    formatTime(r.breakOut),
        "Break End":      formatTime(r.breakIn),
        "Out Time":       formatTime(r.outTime),
        "Working Hours":  r.workingHours || "--",
        "Required Hours": 9,
        "Extra Hours":    sign + formatHoursToHMM(Math.abs(extra)),
        "Remarks":        working === 0 ? "Leave" : working < 6 ? "Half Day" : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
    XLSX.writeFile(wb, `daily-report-${startDate}-${endDate}.xlsx`);
  };

  const search = async () => {
    if (!startDate || !endDate) { showError("Please select both start and end dates"); return; }
    if (startDate > endDate)    { showError("Start date must be before end date"); return; }
    try {
      setLoading(true);
      const response = await reportService.getDailyRangeReport(startDate, endDate);
      setReports(Array.isArray(response.data) ? response.data : response.data ? [response.data] : []);
    } catch {
      showError("Unable To Load Report");
    } finally {
      setLoading(false);
    }
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
          <small className="text-muted">View your attendance by date range</small>
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
              <button className="btn btn-success w-100" onClick={exportExcel} disabled={!reports.length}>
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {reports.length === 0 && !loading ? (
        <div className="alert alert-info">No report data found for the selected date range.</div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <AppDataGrid
              rows={reports}
              columns={columns}
              loading={loading}
              getRowClassName={(params) => {
                const working = parseWorkingHours(params.row.workingHours);
                if (working === 0) return "leave-row";
                if (working < 6)   return "halfday-row";
                return "";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyReport;
