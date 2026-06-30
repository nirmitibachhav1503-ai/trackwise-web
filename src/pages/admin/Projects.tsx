import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AppDataGrid from "../../components/common/AppDataGrid";
import adminService from "../../services/adminService";
import type { Employee } from "../../types/employee";
import { showSuccess, showError, showWarning } from "../../utils/toast";
import { confirmDelete } from "../../utils/confirm";

interface Project {
  projectId: number;
  projectName: string;
  projectCreateDate: string;
  assignTo: string;
  managerName: string;
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editManagerCode, setEditManagerCode] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProjects();
      setProjects(response.data);
    } catch {
      showError("Failed To Load Projects");
    } finally {
      setLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      const response = await adminService.getManagers();
      setManagers(response.data);
    } catch {
      showError("Unable To Load Managers");
    }
  };

  useEffect(() => {
    loadProjects();
    loadManagers();
  }, []);

  const addProject = async () => {
    if (!projectName || !selectedManager) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      await adminService.addProject({
        projectName,
        empCode: selectedManager
      });
      showSuccess("Project Added Successfully");
      setProjectName("");
      setSelectedManager("");
      loadProjects();
    } catch {
      showError("Unable To Add Project");
    }
  };

  const deleteProject = async (projectId: number) => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      await adminService.deleteProject(projectId);
      showSuccess("Project Deleted Successfully");
      loadProjects();
    } catch {
      showError("Unable To Delete Project");
    }
  };

  const openEdit = (project: Project) => {
    setEditProjectId(project.projectId);
    setEditProjectName(project.projectName);
    setEditManagerCode(project.assignTo);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditProjectId(null);
    setEditProjectName("");
    setEditManagerCode("");
  };

  const saveEdit = async () => {
    if (!editProjectId || !editProjectName || !editManagerCode) {
      showWarning("Please Fill All Fields");
      return;
    }

    try {
      await adminService.updateProject(editProjectId, {
        projectName: editProjectName,
        empCode: editManagerCode
      });
      showSuccess("Project Updated Successfully");
      closeEdit();
      loadProjects();
    } catch {
      showError("Unable To Update Project");
    }
  };

  const formatDate = (val: string | null) => {
    if (!val) return "-";
    const date = new Date(val);
    return isNaN(date.getTime()) ? val : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  };

  const managerOptions = managers.map(m => ({
    value: m.employeeCode,
    label: `${m.fullName} (${m.employeeCode})`
  }));

  const columns: GridColDef[] = [
    { field: "projectName", headerName: "Project Name", flex: 1.5 },
    { field: "managerName", headerName: "Manager Name", flex: 1.5 },
    { field: "createdDate", headerName: "Created Date", flex: 1, valueFormatter: (val) => formatDate(val) },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button
            color="primary"
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => openEdit(params.row)}
          >
            Edit
          </Button>
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => deleteProject(params.row.projectId)}
          >
            Delete
          </Button>
        </>
      )
    }
  ];

  const rows = projects.map((p) => ({
    id: p.projectId,
    projectId: p.projectId,
    projectName: p.projectName,
    managerCode: p.assignTo,
    managerName: p.managerName,
    createdDate: p.projectCreateDate
  }));

  return (
    <div>
      <h2>Project Management</h2>

      <div className="card p-3 mt-3">
        <div className="mb-3">
          <label className="form-label fw-semibold">Add Project</label>
        </div>

        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              fullWidth
              size="small"
            />
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
            >
              <option value="">Select Manager</option>
              {managerOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2">
            <Button
              variant="contained"
              onClick={addProject}
              className="w-100"
              disabled={loading}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="card p-3 mt-4">
        <AppDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
        />
      </div>

      <Dialog
        open={editOpen}
        onClose={closeEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            fullWidth
            margin="normal"
            value={editProjectName}
            onChange={(e) => setEditProjectName(e.target.value)}
          />
          <label className="form-label fw-semibold mt-2">Manager</label>
          <select
            className="form-select"
            value={editManagerCode}
            onChange={(e) => setEditManagerCode(e.target.value)}
          >
            <option value="">Select Manager</option>
            {managerOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Projects;