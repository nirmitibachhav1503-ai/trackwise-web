import { useState, useEffect, useCallback } from "react";
import DatePicker from "../../components/common/DatePicker";
import leaveService from "../../services/leaveService";
import type { Leave } from "../../types/leave";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError } from "../../utils/toast";

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Paid Leave",
  "Unpaid Leave",
  "Work From Home",
  "Half Day",
  "Maternity Leave",
  "Paternity Leave",
  "Comp Off"
];

function ApplyLeave() {
  const { user } = useAuth();
  const storedUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null);
  const userId = storedUser?.userId;

  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const loadLeaves = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingList(true);
      const response = await leaveService.getMyLeaves(userId);
      setLeaves(Array.isArray(response.data) ? response.data : response.data ? [response.data] : []);
    } catch {
      showError("Unable to load leaves");
    } finally {
      setLoadingList(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const applyLeave = async () => {
    if (!fromDate || !toDate || !reason) {
      showError("Please fill all required fields");
      return;
    }
    try {
      setLoadingApply(true);
      await leaveService.applyLeave({ userId, leaveType, fromDate, toDate, reason });
      showSuccess("Leave applied successfully");
      setLeaveType(LEAVE_TYPES[0]);
      setFromDate("");
      setToDate("");
      setReason("");
      loadLeaves();
    } catch (err: any) {
      showError(err?.response?.data?.message || "Unable to apply leave");
    } finally {
      setLoadingApply(false);
    }
  };

  const statusStyles: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "#ffe6e6", text: "#cc0000" },
    Approved: { bg: "#d1e7dd", text: "#0f5132" },
    Rejected: { bg: "#f8d7da", text: "#842029" }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Apply Leave</h4>
          <small className="text-muted">Request a leave</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Leave Type</label>
              <select
                className="form-select"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                disabled={loadingApply}
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
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
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={applyLeave} disabled={loadingApply}>
                {loadingApply ? <span className="spinner-border spinner-border-sm" /> : "Submit"}
              </button>
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-12">
              <label className="form-label fw-semibold">Reason</label>
              <textarea
                className="form-control"
                placeholder="Enter reason for leave"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loadingApply}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white border-0 pt-3 px-4">
          <h5 className="fw-bold mb-0">Leave List</h5>
        </div>
        <div className="card-body p-4">
          {loadingList ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
              <div className="spinner-border text-primary" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center text-muted py-5">No leaves found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.leaveId}>
                      <td>{leave.leaveType || "Casual Leave"}</td>
                      <td>{leave.fromDate}</td>
                      <td>{leave.toDate}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span
                          className="badge rounded-pill px-2 py-1"
                          style={{
                            background: statusStyles[leave.status]?.bg || "#e9ecef",
                            color: statusStyles[leave.status]?.text || "#333"
                          }}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplyLeave;