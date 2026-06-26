import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DatePicker from "../../components/common/DatePicker";
import adminService from "../../services/adminService";
import taskService from "../../services/taskService";
import type { Employee } from "../../types/employee";
import { showSuccess, showError, showWarning } from "../../utils/toast";

function AssignTask() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");

  const loadEmployees = async () => {
    try {
      const response = await adminService.getEmployees();
      setEmployees(response.data);
    } catch {
      showError("Unable To Load Employees");
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const assignTask = async () => {
    if (!userId || !title || !description || !priority || !dueDate) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      setLoading(true);
      await taskService.assignTask({
        userId: Number(userId),
        title,
        description,
        priority,
        dueDate
      });

      showSuccess("Task Assigned Successfully");
      setUserId("");
      setTitle("");
      setDescription("");
      setPriority("");
      setDueDate("");
    } catch {
      showError("Unable To Assign Task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Assign Task</h2>

      <div className="card p-3 mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label">Employee</label>
            <select
              className="form-select"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.userId} value={emp.userId}>
                  {emp.fullName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Priority</label>
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

          <div className="col-12 col-md-4">
            <label className="form-label">Due Date</label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
            />
          </div>

          <div className="col-12">
            <TextField
              label="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
            />
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
    </div>
  );
}

export default AssignTask;
