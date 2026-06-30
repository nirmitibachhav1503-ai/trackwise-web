import { useCallback, useEffect, useState } from "react";
import taskService from "../../services/taskService";
import type { Task } from "../../types/task";
import { showSuccess, showError } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";

function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const response = await taskService.getMyTasks(
        user!.userId,
        filterStatus && filterStatus !== "All" ? filterStatus : null,
        filterPriority && filterPriority !== "All" ? filterPriority : null,
        rowsPerPage,
        currentPage
      );
      setTasks(response.data);
    } catch {
      showError("Unable To Load Tasks");
    } finally {
      setLoadingTasks(false);
    }
  }, [user, filterStatus, filterPriority, rowsPerPage, currentPage]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateStatus = async (taskId: number, status: string) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      showSuccess("Task Status Updated");
      loadTasks();
    } catch {
      showError("Unable To Update Status");
    }
  };

  const priorityStyles: Record<string, { bg: string; text: string }> = {
    High:   { bg: "#fde8e8", text: "#c81e1e" },
    Medium: { bg: "#fff4e0", text: "#b35900" },
    Low:    { bg: "#e6f9f4", text: "#006644" }
  };

  const statusStyles: Record<string, { bg: string; text: string }> = {
    "Pending":     { bg: "#ffe6e6", text: "#cc0000" },
    "In Progress": { bg: "#fff3cd", text: "#856404" },
    "In Review":   { bg: "#d1ecf1", text: "#0c5460" },
    "Resolved":    { bg: "#d1e7dd", text: "#0f5132" },
    "Resolved And Closed": { bg: "#e9ecef", text: "#495057" }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div>
      <h2>My Tasks</h2>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
<div className="card-header bg-white border-0 pt-3 px-4">
           <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
             <h5 className="fw-bold mb-0">Task List</h5>
           </div>
         </div>

        <div className="card-body p-4">
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                <option value="">Status</option>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Resolved And Closed">Resolved And Closed</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm" value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}>
                <option value="">Priority</option>
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              {(filterStatus && filterStatus !== "All") || (filterPriority && filterPriority !== "All") ? (
                <span className="text-primary" style={{ cursor: "pointer", fontSize: "13px", textDecoration: "underline" }} onClick={() => { setFilterStatus(""); setFilterPriority(""); setCurrentPage(1); }}>Clear</span>
              ) : null}
            </div>
          </div>

          {loadingTasks ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
              <div className="spinner-border text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-muted py-5">No rows</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle" style={{ position: "static" }}>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Report Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.taskId}>
                      <td>{task.taskDescription}</td>
                      <td>{task.projectName}</td>
                      <td>
                        <span className="badge rounded-pill px-2 py-1"
                          style={{ background: priorityStyles[task.priority]?.bg || "#e9ecef", color: priorityStyles[task.priority]?.text || "#333" }}>
                          {task.priority}
                        </span>
                      </td>
                      <td>{formatDate(task.reportDate)}</td>
                      <td>
                        <span className="badge rounded-pill px-2 py-1"
                          style={{ background: statusStyles[task.status]?.bg || "#e9ecef", color: statusStyles[task.status]?.text || "#333" }}>
                          {task.status}
                        </span>
                      </td>
                      <td className="dropdown-container">
                        <div className="dropdown d-inline" data-bs-display="static">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            ⋮
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end" style={{ zIndex: 1000, position: "absolute" }}>
                            {task.status !== "In Progress" && (
                              <li>
                                <button className="dropdown-item" type="button" onClick={() => updateStatus(task.taskId, "In Progress")}>In Progress</button>
                              </li>
                            )}
                            {task.status !== "In Review" && (
                              <li>
                                <button className="dropdown-item" type="button" onClick={() => updateStatus(task.taskId, "In Review")}>In Review</button>
                              </li>
                            )}
                            {(task.status === "Pending" || task.status === "In Progress") && (
                              <li>
                                <button className="dropdown-item" type="button" onClick={() => updateStatus(task.taskId, "Resolved")}>Resolved</button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer bg-white border-0 px-4 pb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: "13px" }}>Rows per page:</span>
            <select className="form-select form-select-sm" style={{ width: "auto" }} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
<div className="text-muted" style={{ fontSize: "13px" }}>
              {tasks.length === 0 ? "0–0 of 0" : `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, tasks.length)} of ${tasks.length}`}
            </div>
        </div>
      </div>
    </div>
  );
}

export default MyTasks;
