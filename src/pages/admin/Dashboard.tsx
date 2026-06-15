import { useEffect, useState } from "react";
import dashboardService from "../../services/dashboardService";
import AttendancePieChart from "../../components/charts/AttendancePieChart";
import WorkingTrendChart from "../../components/charts/WorkingTrendChart";

interface DashboardData {
  totalEmployees: number;
  presentEmployees: number;
  absentEmployees: number;
  overtimeEmployees: number;
  deficitEmployees: number;
  totalWorkingHours: string;
}

const statCards = (d: DashboardData) => [
  { title: "Total Employees", value: d.totalEmployees, icon: "👥", color: "#4361ee" },
  { title: "Present Today", value: d.presentEmployees, icon: "✅", color: "#2ec4b6" },
  { title: "Absent Today", value: d.absentEmployees, icon: "❌", color: "#e63946" },
  { title: "Overtime", value: d.overtimeEmployees, icon: "⏰", color: "#f4a261" },
  { title: "Deficit", value: d.deficitEmployees, icon: "⚠️", color: "#e76f51" },
  { title: "Total Working Hours", value: d.totalWorkingHours, icon: "🕐", color: "#06d6a0" },
];

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      const dashboardRes = await dashboardService.getAdminDashboard();
      setDashboard(dashboardRes.data);
      setError(null);
    } catch (err: any) {
      console.error("Admin dashboard error:", err?.response?.status, err?.response?.config?.url);
      setError(`Dashboard API failed (${err?.response?.status ?? "Network Error"})`);
    }

    try {
      const trendRes = await dashboardService.getWorkingTrend();
      setTrendData(Array.isArray(trendRes.data) ? trendRes.data : []);
    } catch (err: any) {
      console.error("Working trend error:", err?.response?.status);
      setTrendData([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
    const id = setInterval(loadDashboard, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div>
      {error && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
          <span>⚠️</span> {error}
          <button className="btn btn-sm btn-outline-warning ms-2" onClick={loadDashboard}>Retry</button>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Admin Dashboard</h4>
          <small className="text-muted">Live overview · auto-refreshes every 30s</small>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadDashboard}>
          🔄 Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        {dashboard ? statCards(dashboard).map((card) => (
          <div className="col-md-4 col-sm-6" key={card.title}>
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
              <div className="card-body d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                  style={{ width: "52px", height: "52px", background: card.color + "22" }}
                >
                  {card.icon}
                </div>
                <div>
                  <div className="text-muted small">{card.title}</div>
                  <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-12">
            <div className="alert alert-light border mb-0">
              Dashboard data is not available yet.
            </div>
          </div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Attendance Overview</h6>
              <AttendancePieChart
                present={dashboard?.presentEmployees || 0}
                absent={dashboard?.absentEmployees || 0}
              />
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Working Hours Trend</h6>
              <WorkingTrendChart data={trendData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
