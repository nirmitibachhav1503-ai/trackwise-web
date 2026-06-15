import { useState } from "react";
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

const columns: GridColDef[] = [
  { field: "reportDate",   headerName: "Date",          flex: 1, valueFormatter: (val) => formatDate(val) },
  { field: "inTime",       headerName: "In Time",       flex: 1, valueFormatter: (val) => formatTime(val) },
  { field: "outTime",      headerName: "Out Time",      flex: 1, valueFormatter: (val) => formatTime(val) },
  { field: "breakOut",     headerName: "Break Start",   flex: 1, valueFormatter: (val) => formatTime(val) },
  { field: "breakIn",      headerName: "Break End",     flex: 1, valueFormatter: (val) => formatTime(val) },
  { field: "workingHours", headerName: "Working Hours", flex: 1 },
  { field: "totalHours",   headerName: "Total Hours",   flex: 1 },
];

function DailyReport() {
  const today = getTodayKey();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate]     = useState(today);
  const [loading, setLoading]     = useState(false);
  const [reports, setReports]     = useState<any[]>([]);

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Daily Report</h4>
          <small className="text-muted">View your attendance by date range</small>
        </div>
      </div>

      {/* Info banner */}
      <div className="alert alert-info py-2 mb-3 d-flex align-items-center gap-2" style={{ borderRadius: "10px", fontSize: "13px" }}>
        <span>ℹ️</span>
        <span>
          <strong>Working Hours</strong> are the actual hours worked by an employee, calculated by
          excluding <strong>lunch breaks</strong> and other <strong>short breaks</strong> from the total time spent at work.
        </span>
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
                onClick={() => reportService.exportDailyRange(startDate, endDate)}
                disabled={!startDate || !endDate}
              >
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
            <AppDataGrid rows={reports} columns={columns} loading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyReport;
