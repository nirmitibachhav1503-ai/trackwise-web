import { useEffect, useRef, useState } from "react";
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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [assignLeadOpen, setAssignLeadOpen] = useState(false);
  const [assignEmployee, setAssignEmployee] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const assignLead = async (employee: Employee) => {
    setAssignEmployee(employee);
    setSelectedProjectId("");
    try {
      const response = await adminService.getManagerProjects(user!.userId);
      setProjects(response.data);
    } catch {
      showError("Unable To Load Projects");
    }
    setAssignLeadOpen(true);
  };

  const submitAssignLead = async () => {
    if (!selectedProjectId) {
      showWarning("Please Select A Project");
      return;
    }
    try {
      const project = projects.find((p) => p.projectId === Number(selectedProjectId));
      await adminService.assignTeamLead({
        employeeId: assignEmployee!.userId,
        projectName: project?.projectName
      });
      showSuccess("Lead Assigned Successfully");
      setAssignLeadOpen(false);
    } catch {
      showError("Assign Lead Failed");
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
      field: "projectNames",
      headerName: "Team Lead Of",
      flex: 1.5,
      valueGetter: (value: string | null) => value || "-"
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const { userId } = params.row;
        const isOpen = openMenuId === userId;
        return (
          <div ref={isOpen ? menuRef : null} style={{ position: "relative", display: "inline-block" }}>
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ lineHeight: 1, padding: "2px 8px", fontSize: "18px" }}
              onClick={() => setOpenMenuId(isOpen ? null : userId)}
            >
              ⋮
            </button>
            {isOpen && (
              <ul className="dropdown-menu show" style={{ position: "fixed", zIndex: 9999, minWidth: "130px" }}>
                <li>
                  <button className="dropdown-item" onClick={() => { editEmployee(params.row); setOpenMenuId(null); }}>Edit</button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={() => { deleteEmployee(userId); setOpenMenuId(null); }}>Delete</button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => { assignLead(params.row); setOpenMenuId(null); }}>Assign Lead</button>
                </li>
              </ul>
            )}
          </div>
        );
      }
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

      <Dialog open={assignLeadOpen} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Lead — {assignEmployee?.fullName}</DialogTitle>
        <DialogContent>
          <select
            className="form-select mt-2"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
            ))}
          </select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignLeadOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitAssignLead}>Assign Lead</Button>
        </DialogActions>
      </Dialog>

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
