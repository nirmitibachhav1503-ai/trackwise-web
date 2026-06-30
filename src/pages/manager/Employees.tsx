import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";
import AppDataGrid from "../../components/common/AppDataGrid";
import adminService from "../../services/adminService";
import type { Employee } from "../../types/employee";
import { showSuccess, showError, showWarning } from "../../utils/toast";
import { confirmDelete } from "../../utils/confirm";
import { useAuth } from "../../context/AuthContext";

function ManagerEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await adminService.getManagerEmployees(user!.userId);
      setEmployees(response.data);
    } catch {
      showError("Unable To Load Employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const resetForm = () => {
    setSelectedId(0);
    setEmployeeCode("");
    setFullName("");
    setEmail("");
    setPassword("");
  };

  const saveEmployee = async () => {
    if (!fullName || !email) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      if (selectedId === 0) {
        await adminService.addManagerEmployee({
          fullName,
          email,
          password,
          roleName: "Employee",
          managerUserId: user!.userId
        });
        showSuccess("Employee Added Successfully");
      } else {
        await adminService.updateEmployee(
          selectedId,
          {
            fullName,
            email
          }
        );
        showSuccess("Employee Updated Successfully");
      }

      setOpen(false);
      resetForm();
      loadEmployees();
    } catch {
      showError("Operation Failed");
    }
  };

  const editEmployee = (employee: Employee) => {
    setSelectedId(employee.userId);
    setEmployeeCode(employee.employeeCode);
    setFullName(employee.fullName);
    setEmail(employee.email);
    setOpen(true);
  };

  const deleteEmployee = async (id: number) => {
    const confirmed = await confirmDelete();

    if (!confirmed) {
      return;
    }

    try {
      await adminService.deleteEmployee(id);
      showSuccess("Employee Deleted");
      loadEmployees();
    } catch {
      showError("Delete Failed");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "employeeCode",
      headerName: "Code",
      flex: 1
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1
    },
    {
      field: "roleName",
      headerName: "Role",
      flex: 1
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => editEmployee(params.row)}
          >
            Edit
          </Button>

          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => deleteEmployee(params.row.userId)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const filteredEmployees = employees.filter(
    x => x.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Employee Management</h2>

      <div className="d-flex justify-content-between">
        <Button
          variant="contained"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Employee
        </Button>
      </div>

      <TextField
        label="Search Employee"
        fullWidth
        sx={{ mt: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-4">
        <AppDataGrid
          rows={filteredEmployees}
          columns={columns}
          loading={loading}
        />
      </div>

      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedId === 0
            ? "Add Employee"
            : "Edit Employee"
          }
        </DialogTitle>

        <DialogContent>

          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {selectedId === 0 &&
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          }
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={saveEmployee}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ManagerEmployees;
