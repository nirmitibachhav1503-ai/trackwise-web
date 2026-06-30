import { useEffect, useState } from "react";
import employeeService from "../../services/employeeService";
import type { EmployeeDashboard } from "../../types/employeeDashboard";

const statCards = (d: EmployeeDashboard) => [
  { title: "Today Working Hours", value: d.workingHours  || "00:00", icon: "⏱", color: "#4361ee" },
  { title: "Extra Hours",         value: d.extraHours    || "00:00", icon: "⚡", color: "#f4a261" },
  { title: "Weekly Hours",        value: d.weeklyHours   || "00:00", icon: "📅", color: "#2ec4b6" },
  { title: "Monthly Hours",       value: d.monthlyHours  || "00:00", icon: "📈", color: "#06d6a0" },
  { title: "Check In",            value: d.inTime        ? new Date(d.inTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--", icon: "🟢", color: "#2ec4b6" },
  { title: "Check Out",           value: d.outTime       ? new Date(d.outTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--", icon: "🔴", color: "#e63946" },
  { title: "Manager",             value: d.manager       || "Not Assigned", icon: "👨‍💼", color: "#6f42c1" },
];

function Dashboard() {
  const [data, setData] = useState<EmployeeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const response = await employeeService.getDashboard();
      console.log("Employee dashboard response:", response.data);
      setData(response.data);
      setError("");
    } catch (err: any) {
      console.error("Employee dashboard error:", err?.response?.status, err?.response?.config?.url);
      setError(
        err?.response?.status === 404
          ? `API not found: ${err?.response?.config?.url}`
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Employee Dashboard</h4>
          <small className="text-muted">Today's attendance overview</small>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadDashboard}>🔄 Refresh</button>
      </div>

      {error && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
          <span>⚠️</span> {error}
          <button className="btn btn-sm btn-outline-warning ms-2" onClick={loadDashboard}>Retry</button>
        </div>
      )}

      <div className="row g-3">
        {data && statCards(data).map((card) => (
          <div className="col-md-4 col-sm-6" key={card.title}>
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
              <div className="card-body d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                  style={{ width: "52px", height: "52px", background: card.color + "22", flexShrink: 0 }}
                >
                  {card.icon}
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: "12px" }}>{card.title}</div>
                  <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!data && !error && (
          <div className="col-12">
            <div className="alert alert-info">No attendance data found for today.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
