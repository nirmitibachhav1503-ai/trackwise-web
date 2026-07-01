import { useEffect, useRef, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid/models";
import AppDataGrid from "../../components/common/AppDataGrid";
import DatePicker from "../../components/common/DatePicker";
import adminService from "../../services/adminService";
import leaveService from "../../services/leaveService";
import type { Leave } from "../../types/leave";
import type { Employee } from "../../types/employee";
import { showSuccess, showError } from "../../utils/toast";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"];

function Leaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await adminService.getEmployees();
      setEmployees(response.data);
    } catch {
      showError("Unable To Load Employees");
    }
  };

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const response = await adminService.getLeaves(
        selectedEmployee ? Number(selectedEmployee) : undefined,
        selectedStatus === "All" ? undefined : selectedStatus,
        fromDate || undefined,
        toDate || undefined
      );
      setLeaves(response.data);
    } catch {
      showError("Unable To Load Leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadLeaves();
  }, []);

  const clearFilters = () => {
    setSelectedEmployee("");
    setSelectedStatus("All");
    setFromDate("");
    setToDate("");
    loadLeaves();
  };

  const searchLeaves = () => {
    loadLeaves();
  };

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

  const formatDate = (val: string | null) => {
    if (!val) return "-";
    try {
      return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    } catch {
      return val;
    }
  };

  const getLeaveTypeLabel = (leaveType: string | null | undefined) => {
    if (typeof leaveType === "string") {
      const trimmed = leaveType.trim();
      if (trimmed && trimmed.toLowerCase() !== "null") {
        return trimmed;
      }
    }

    return "Casual Leave";
  };

  const columns: GridColDef[] = [
    { field: "employeeName", headerName: "Employee", flex: 1.5 },
    {
      field: "leaveType",
      headerName: "Leave Type",
      flex: 1,
      valueGetter: (value: string | null) => getLeaveTypeLabel(value)
    },
    { field: "fromDate", headerName: "From", flex: 1, valueFormatter: (v) => formatDate(v) },
    { field: "toDate", headerName: "To", flex: 1, valueFormatter: (v) => formatDate(v) },
    { field: "reason", headerName: "Reason", flex: 2 },
    { field: "createdDate", headerName: "Applied On", flex: 1, valueFormatter: (v) => formatDate(v) },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        if (!params?.row) return null;
        const { status, leaveId } = params.row;
        const isOpen = openMenuId === leaveId;
        return (
          <div ref={isOpen ? menuRef : null} style={{ position: "relative", display: "inline-block" }}>
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ lineHeight: 1, padding: "2px 8px", fontSize: "18px" }}
              onClick={() => setOpenMenuId(isOpen ? null : leaveId)}
            >
              ⋮
            </button>
            {isOpen && (
              <ul
                className="dropdown-menu show"
                style={{ position: "fixed", zIndex: 9999, minWidth: "120px" }}
              >
                {status === "Pending" ? (
                  <>
                    <li>
                      <button className="dropdown-item" onClick={() => { approveLeave(leaveId); setOpenMenuId(null); }}>Approve</button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => { rejectLeave(leaveId); setOpenMenuId(null); }}>Reject</button>
                    </li>
                  </>
                ) : (
                  <li>
                    <button className="dropdown-item" onClick={() => { viewLeave(leaveId); setOpenMenuId(null); }}>View</button>
                  </li>
                )}
              </ul>
            )}
          </div>
        );
      }
    }
  ];

  const viewLeave = (leaveId: number) => {
    console.log("View leave:", leaveId);
  };

  const filteredLeaves = leaves.map((leave, index) => ({ ...leave, id: leave.leaveId != null ? leave.leaveId : `row-${index}` }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Leave Management</h4>
          <small className="text-muted">View and manage employee leaves</small>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Employee</label>
              <select
                className="form-select"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.userId} value={emp.userId}>{emp.fullName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">From Date</label>
              <DatePicker value={fromDate} onChange={setFromDate} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">To Date</label>
              <DatePicker value={toDate} onChange={setToDate} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={searchLeaves} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : "Search"}
              </button>
            </div>
            <div className="col-md-2">
              {(selectedEmployee || selectedStatus !== "All" || fromDate || toDate) && (
                <span className="text-primary" style={{ cursor: "pointer", fontSize: "13px", textDecoration: "underline" }} onClick={clearFilters}>
                  Clear
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leave List */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
              <div className="spinner-border text-primary" />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center text-muted py-5">No leaves found</div>
          ) : (
            <AppDataGrid
              rows={filteredLeaves}
              columns={columns}
              loading={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaves;