import { useEffect, useState } from "react";
import taskService from "../../services/taskService";
  import type { TaskDashboard as TaskDashboardData } from "../../types/task";
import { showError } from "../../utils/toast";

function TaskDashboard() {
  const [data, setData] = useState<TaskDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const response = await taskService.getDashboard();
      setData(response.data);
      setError("");
    } catch {
      setError("Unable To Load Dashboard");
      showError("Unable To Load Dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Manager Dashboard</h4>
          <small className="text-muted">Task overview and assignments</small>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadDashboard}>🔄 Refresh</button>
      </div>

      {error && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
          <span>⚠️</span> {error}
          <button className="btn btn-sm btn-outline-warning ms-2" onClick={loadDashboard}>Retry</button>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                style={{ width: "52px", height: "52px", background: "#4361ee22" }}>
                👥
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "12px" }}>Total Employees</div>
                <div className="fw-bold fs-4" style={{ color: "#4361ee" }}>{data?.totalEmployees || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                style={{ width: "52px", height: "52px", background: "#2ec4b622" }}>
                📋
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "12px" }}>Total Assigned Tasks</div>
                <div className="fw-bold fs-4" style={{ color: "#2ec4b6" }}>{data?.totalAssignedTasks || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                style={{ width: "52px", height: "52px", background: "#f4a26122" }}>
                ⏳
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "12px" }}>Pending Tasks</div>
                <div className="fw-bold fs-4" style={{ color: "#f4a261" }}>{data?.pendingTasks || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                style={{ width: "52px", height: "52px", background: "#4361ee22" }}>
                🔄
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "12px" }}>In Progress Tasks</div>
                <div className="fw-bold fs-4" style={{ color: "#4361ee" }}>{data?.inProgressTasks || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
            <div className="card-body d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3 fs-4"
                style={{ width: "52px", height: "52px", background: "#06d6a022" }}>
                ✅
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "12px" }}>Completed Tasks</div>
                <div className="fw-bold fs-4" style={{ color: "#06d6a0" }}>{data?.completedTasks || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDashboard;
