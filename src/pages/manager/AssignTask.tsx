import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import adminService from "../../services/adminService";
import taskService from "../../services/taskService";
import type { Employee } from "../../types/employee";
import type { Task } from "../../types/task";
import { showSuccess, showError, showWarning } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";

function AssignTask() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<{ projectId: number; projectName: string }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState("");
  const [projectId, setProjectId] = useState("");
  const [, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [, setReportDate] = useState("");
  const [search, setSearch] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);

  const loadEmployees = async () => {
    try {
      const response = await adminService.getManagerEmployees(user!.userId);
      setEmployees(response.data);
    } catch {
      showError("Unable To Load Employees");
    }
  };

  const loadProjects = async () => {
    try {
      const response = await adminService.getManagerProjects(user!.userId);
      setProjects(response.data);
    } catch {
      showError("Unable To Load Projects");
    }
  };

const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await taskService.getAllTasks({
        userId: user!.userId,
        employeeId: filterEmployee && filterEmployee !== "All" ? filterEmployee : null,
        projectId: filterProject && filterProject !== "All" ? filterProject : null,
        status: filterStatus && filterStatus !== "All" ? filterStatus : null,
        priority: filterPriority && filterPriority !== "All" ? filterPriority : null,
        pageSize: rowsPerPage,
        pageNo: currentPage
      });
      setTasks(response.data);
    } catch {
      showError("Unable To Load Tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      loadEmployees();
      loadProjects();
    }
    loadTasks();
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [filterEmployee, filterProject, filterStatus, filterPriority, rowsPerPage, currentPage]);

  const markResolved = async (taskId: number) => {
    try {
      await taskService.updateTaskStatus(taskId, "Resolved And Closed");
      showSuccess("Task Marked as Resolved And Closed");
      loadTasks();
    } catch {
      showError("Unable To Update Status");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      showSuccess("Task Deleted");
      loadTasks();
    } catch {
      showError("Unable To Delete Task");
    }
  };

  const updateTask = async () => {
    if (!editTaskId || !employeeCode || !projectId || !description || !priority) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      await taskService.updateTask(editTaskId, {
        employeeCode,
        projectId: Number(projectId),
        description,
        priority
      });
      showSuccess("Task Updated Successfully");
      setEditOpen(false);
      setEditTaskId(null);
      setEmployeeCode("");
      setProjectId("");
      setDescription("");
      setPriority("");
      loadTasks();
    } catch {
      showError("Unable To Update Task");
    }
  };

  const openEditTask = (task: Task) => {
    setEditTaskId(task.taskId);
    setEmployeeCode(task.assignTo || "");
    setProjectId(String(task.projectId || ""));
    setDescription(task.taskDescription || "");
    setPriority(task.priority || "");
    setEditOpen(true);
  };

  const assignTask = async () => {
    if (!employeeCode || !projectId || !description || !priority) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      setLoading(true);
      await taskService.assignTask({
        employeeCode,
        projectId: Number(projectId),
        description,
        priority
      });

      showSuccess("Task Assigned Successfully");
      setEmployeeCode("");
      setProjectId("");
      setTitle("");
      setDescription("");
      setPriority("");
      setReportDate("");
      loadTasks();
    } catch {
      showError("Unable To Assign Task");
    } finally {
      setLoading(false);
    }
  };

  const initials = (name: string) => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

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

  const totalPages = Math.max(1, Math.ceil(tasks.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTasks = tasks.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  return (
    <div>
      <h2 className="fw-bold mb-3">Assign Task</h2>
      <style>{`
        .dropdown-container { position: relative; z-index: 1055 !important; }
        .table-responsive { overflow: visible !important; }
      `}</style>

      <div className="card p-4 mb-4 border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Employee</label>
            <select
              className="form-select"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.employeeCode} value={emp.employeeCode}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Project</label>
            <select
              className="form-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map(proj => (
                <option key={proj.projectId} value={proj.projectId}>
                  {proj.projectName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Priority</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Select Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="col-12">
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          </div>

          <div className="col-12">
            <Button
              variant="contained"
              onClick={assignTask}
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign Task"}
            </Button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white border-0 pt-3 px-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="fw-bold mb-0">Task List</h5>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: "220px" }}
              placeholder="Search Task"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body p-4">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-3">
              <select className="form-select form-select-sm" value={filterEmployee} onChange={(e) => { setFilterEmployee(e.target.value); setCurrentPage(1); }}>
                <option value="">Employee</option>
                <option value="All">All</option>
                {employees.map(emp => (
                  <option key={emp.userId} value={emp.userId}>{emp.fullName}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm" value={filterProject} onChange={(e) => { setFilterProject(e.target.value); setCurrentPage(1); }}>
                <option value="">Project</option>
                {projects.map(proj => (
                  <option key={proj.projectId} value={proj.projectId}>{proj.projectName}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                <option value="">Status</option>
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
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              {(filterEmployee && filterEmployee !== "All") || (filterProject && filterProject !== "All") || (filterStatus && filterStatus !== "All") || (filterPriority && filterPriority !== "All") ? (
                <span className="text-primary" style={{ cursor: "pointer", fontSize: "13px", textDecoration: "underline" }} onClick={() => { setFilterEmployee(""); setFilterProject(""); setFilterStatus(""); setFilterPriority(""); setCurrentPage(1); }}>Clear</span>
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
                    <th>Employee</th>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Report Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map(task => (
                    <tr key={task.taskId}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: "32px", height: "32px", fontSize: "12px", background: "#1e5cb3" }}>
                            {initials(task.employeeName || "?")}
                          </div>
                          <span className="fw-medium">{task.employeeName}</span>
                        </div>
                      </td>
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
                            <li>
                              <button className="dropdown-item" type="button" onClick={() => openEditTask(task)}>Edit</button>
                            </li>
                            <li>
                              <button className="dropdown-item" type="button" onClick={() => deleteTask(task.taskId)}>Delete</button>
                            </li>
                            {task.status === "Resolved" && (
                              <li>
                                <button className="dropdown-item" type="button" onClick={() => markResolved(task.taskId)}>Resolved And Closed</button>
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
            {paginatedTasks.length === 0 || tasks.length === 0 ? "0–0 of 0" : `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, tasks.length)} of ${tasks.length}`}
          </div>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <div className="row g-3 mt-1">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Employee</label>
              <select
                className="form-select"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.employeeCode} value={emp.employeeCode}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Project</label>
              <select
                className="form-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Select Project</option>
                {projects.map(proj => (
                  <option key={proj.projectId} value={proj.projectId}>
                    {proj.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-12">
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={3}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={updateTask}>Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AssignTask;