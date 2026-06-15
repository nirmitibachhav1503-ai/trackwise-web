import { useEffect, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AppDataGrid from "../../components/common/AppDataGrid";
import leaveService from "../../services/leaveService";
import type { Leave } from "../../types/leave";
import { showSuccess, showError } from "../../utils/toast";

function Leaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getAllLeaves();
      setLeaves(response.data);
    } catch {
      showError("Unable To Load Leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const approveLeave = async (leaveId: number) => {
    try {
      await leaveService.approveLeave(leaveId);
      showSuccess("Leave Approved");
      loadLeaves();
    } catch {
      showError("Approval Failed");
    }
  };

  const rejectLeave = async (leaveId: number) => {
    try {
      await leaveService.rejectLeave(leaveId);
      showSuccess("Leave Rejected");
      loadLeaves();
    } catch {
      showError("Reject Failed");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "employeeName",
      headerName: "Employee",
      flex: 1
    },
    {
      field: "fromDate",
      headerName: "From Date",
      flex: 1
    },
    {
      field: "toDate",
      headerName: "To Date",
      flex: 1
    },
    {
      field: "reason",
      headerName: "Reason",
      flex: 2
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <div>
          <Button
            color="success"
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => approveLeave(params.row.leaveId)}
          >
            Approve
          </Button>

          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => rejectLeave(params.row.leaveId)}
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  const filteredLeaves = leaves.filter(
    x => x.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Leave Management</h2>

      <div className="mt-4">
        <TextField
          label="Search Employee"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <AppDataGrid
          rows={filteredLeaves}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default Leaves;