import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AppDataGrid from "../../components/common/AppDataGrid";
import taskService from "../../services/taskService";
import type { Task } from "../../types/task";
import { showSuccess, showError } from "../../utils/toast";

function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (employeeFilter) params.employeeId = employeeFilter;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const response = await taskService.getAllTasks(Object.keys(params).length ? params : undefined);
      setTasks(response.data);
    } catch {
      showError("Unable To Load Tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "employeeName",
      headerName: "Employee",
      flex: 1
    },
    {
      field: "title",
      headerName: "Task",
      flex: 1
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1
    }
  ];

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchesEmployee = !employeeFilter || t.userId === Number(employeeFilter);
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    return matchesSearch && matchesEmployee && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <h2>Task List</h2>

      <div className="row g-3 mt-2 align-items-end">
        <div className="col-12 col-md-3">
          <TextField
            label="Search Task"
            fullWidth
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-2">
          <label className="form-label">Employee</label>
          <select
            className="form-select"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">All</option>
            {Array.from(new Set(tasks.map(t => t.userId))).map(id => (
              <option key={id} value={id}>
                {tasks.find(t => t.userId === id)?.employeeName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-2">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="col-12 col-md-2">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="col-12 col-md-2">
          <Button variant="contained" onClick={loadTasks} className="w-100">
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <AppDataGrid
          rows={filteredTasks.map(t => ({ ...t, id: t.taskId }))}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default TaskList;
