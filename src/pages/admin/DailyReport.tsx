import { useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import AppDataGrid from "../../components/common/AppDataGrid";
import DatePicker from "../../components/common/DatePicker";
import reportService from "../../services/reportService";
import { showError } from "../../utils/toast";

const columns: GridColDef[] = [
  { field: "employeeName",  headerName: "Employee",       flex: 1.5 },
  { field: "inTime",        headerName: "In Time",        flex: 1 },
  { field: "outTime",       headerName: "Out Time",       flex: 1 },
  { field: "workingHours",  headerName: "Working Hours",  flex: 1 },
  { field: "extraHours",    headerName: "Extra Hours",    flex: 1 },
];

function DailyReport() {
  const [reportDate, setReportDate] = useState("");
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [reports, setReports]       = useState<any[]>([]);

  const searchReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getDailyReport(reportDate);
      setReports(response.data);
    } catch {
      showError("Unable To Load Report");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(x =>
    x.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Daily Report</h4>
          <small className="text-muted">Employee attendance by date</small>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Report Date</label>
              <DatePicker value={reportDate} onChange={setReportDate} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={searchReport} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : "🔍 Search"}
              </button>
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={() => reportService.exportDaily(reportDate)} disabled={!reportDate}>
                📥 Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {filteredReports.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { title: "Total Employees", value: filteredReports.length,  icon: "👥", color: "#4361ee" },
            { title: "Present",         value: filteredReports.filter(r => r.inTime).length, icon: "✅", color: "#2ec4b6" },
            { title: "Absent",          value: filteredReports.filter(r => !r.inTime).length, icon: "❌", color: "#e63946" },
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
          <AppDataGrid rows={filteredReports} columns={columns} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default DailyReport;
