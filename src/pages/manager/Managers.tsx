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

function Managers() {
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadManagers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getManagers();
      setManagers(response.data);
    } catch {
      showError("Unable To Load Managers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const resetForm = () => {
    setSelectedId(0);
    setEmployeeCode("");
    setFullName("");
    setEmail("");
    setPassword("");
  };

  const saveManager = async () => {
    if (!employeeCode || !fullName || !email) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      if (selectedId === 0) {
        await adminService.addManager({
          employeeCode,
          fullName,
          email,
          password
        });
        showSuccess("Manager Added Successfully");
      } else {
        await adminService.updateManager(
          selectedId,
          {
            fullName,
            email
          }
        );
        showSuccess("Manager Updated Successfully");
      }

      setOpen(false);
      resetForm();
      loadManagers();
    } catch {
      showError("Operation Failed");
    }
  };

  const editManager = (manager: Employee) => {
    setSelectedId(manager.userId);
    setEmployeeCode(manager.employeeCode);
    setFullName(manager.fullName);
    setEmail(manager.email);
    setOpen(true);
  };

  const deleteManager = async (id: number) => {
    const confirmed = await confirmDelete();

    if (!confirmed) {
      return;
    }

    try {
      await adminService.deleteManager(id);
      showSuccess("Manager Deleted");
      loadManagers();
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
            onClick={() => editManager(params.row)}
          >
            Edit
          </Button>

          <Button
            color="error"
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => deleteManager(params.row.userId)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const filteredManagers = managers.filter(
    x => x.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Manager Management</h2>

      <div className="d-flex justify-content-between">
        <Button
          variant="contained"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add Manager
        </Button>
      </div>

      <TextField
        label="Search Manager"
        fullWidth
        sx={{ mt: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-4">
        <AppDataGrid
          rows={filteredManagers}
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
            ? "Add Manager"
            : "Edit Manager"
          }
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Employee Code"
            fullWidth
            margin="normal"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
          />

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
            onClick={saveManager}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Managers;