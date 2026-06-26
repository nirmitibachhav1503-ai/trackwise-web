import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import Button from "@mui/material/Button";
import AppDataGrid from "../../components/common/AppDataGrid";
import taskService from "../../services/taskService";
import type { Task } from "../../types/task";
import { showSuccess, showError } from "../../utils/toast";

function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getMyTasks();
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

  const updateStatus = async (taskId: number, status: string) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      showSuccess("Task Status Updated");
      loadTasks();
    } catch {
      showError("Unable To Update Status");
    }
  };

  const columns: GridColDef[] = [
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
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <div>
          <select
            className="form-select form-select-sm"
            style={{ width: "auto", display: "inline-block" }}
            value={params.row.status}
            onChange={(e) => updateStatus(params.row.taskId, e.target.value)}
            disabled={params.row.status === "Completed"}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      )
    }
  ];

  const rows = tasks.map(t => ({
    ...t,
    id: t.taskId
  }));

  return (
    <div>
      <h2>My Tasks</h2>

      <div className="mt-4">
        <AppDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default MyTasks;
