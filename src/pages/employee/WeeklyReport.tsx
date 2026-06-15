import { useState } from "react";
import DatePicker from "../../components/common/DatePicker";
import reportService from "../../services/reportService";
import { showError } from "../../utils/toast";

function WeeklyReport() {
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
      const response = await reportService.getWeeklyReport(startDate, endDate);
      console.log("Weekly report response:", response.data);
      setData(response.data);
    } catch (err: any) {
      console.error("Weekly report error:", err?.response?.status, err?.response?.data);
      showError("Unable to load weekly report");
    } finally {
      setLoading(false);
    }
  };

  // Normalize — API may return object or array
  const rows: any[] = Array.isArray(data) ? data : data ? [data] : [];

  const showSaturday = rows.some((r) => (r.saturdayMinutes ?? 0) > 0);

  const allDays = [
    { field: "monday",    label: "Mon" },
    { field: "tuesday",   label: "Tue" },
    { field: "wednesday", label: "Wed" },
    { field: "thursday",  label: "Thu" },
    { field: "friday",    label: "Fri" },
    { field: "saturday",  label: "Sat" },
  ];

  const visibleDays = showSaturday ? allDays : allDays.slice(0, 5);

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
                onClick={() => reportService.exportWeekly(startDate, endDate)}
                disabled={!startDate || !endDate}
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                <div className="text-muted small">Total Working Hours</div>
                <div className="fw-bold fs-3" style={{ color: "#4361ee" }}>{rows[0]?.totalWorkingHours || rows[0]?.workingHours || "00:00"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {rows.length > 0 ? (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead style={{ background: "#f4f6f9" }}>
                <tr>
                  {visibleDays.map(({ field, label }, i) => {
                    const d = startDate ? new Date(startDate) : null;
                    if (d) d.setDate(d.getDate() + i);
                    const dateStr = d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "";
                    return <th key={field} className="px-4 py-3">{label}{dateStr ? ` (${dateStr})` : ""}</th>;
                  })}
                  <th className="px-4 py-3">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item: any, index: number) => (
                  <tr key={index}>
                    {visibleDays.map(({ field }) => (
                      <td key={field} className="px-4 py-3">{item[field] || "-"}</td>
                    ))}
                    <td className="px-4 py-3">{item.totalWorkingHours || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !loading && data !== null ? (
        <div className="alert alert-info">No report data found for the selected date range.</div>
      ) : null}
    </div>
  );
}

export default WeeklyReport;
