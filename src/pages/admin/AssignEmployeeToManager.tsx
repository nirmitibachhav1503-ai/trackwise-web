import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import type { Employee } from "../../types/employee";
import { showSuccess, showError } from "../../utils/toast";

function AssignEmployeeToManager() {
  const [managers, setManagers] = useState<Employee[]>([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

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

  const loadUnassignedEmployees = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUnassignedEmployees(selectedManager);
      setUnassignedEmployees(response.data);
      const preSelected = response.data
        .filter((emp: Employee) => emp.isAssigned === 1)
        .map((emp: Employee) => emp.employeeCode);
      setSelectedEmployees(preSelected);
    } catch {
      showError("Unable To Load Employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  useEffect(() => {
    if (selectedManager) {
      loadUnassignedEmployees();
    } else {
      setUnassignedEmployees([]);
      setSelectedEmployees([]);
    }
  }, [selectedManager]);

  const toggleEmployee = (empCode: string) => {
    setSelectedEmployees(prev =>
      prev.includes(empCode)
        ? prev.filter(code => code !== empCode)
        : [...prev, empCode]
    );
  };

  const handleSave = async () => {
    if (!selectedManager) {
      showError("Please Select A Manager");
      return;
    }

    if (selectedEmployees.length === 0) {
      showError("Please Select At Least One Employee");
      return;
    }

    try {
      setLoading(true);
      await adminService.assignEmployeesToManager(
        selectedManager,
        selectedEmployees.join(",")
      );
      showSuccess("Employees Assigned Successfully");
      setSelectedEmployees([]);
      loadUnassignedEmployees();
    } catch {
      showError("Operation Failed");
    } finally {
      setLoading(false);
    }
  };

  const managerOptions = managers.map(m => ({
    value: m.employeeCode,
    label: `${m.fullName} (${m.employeeCode})`
  }));

  return (
    <div>
      <h2 className="fw-bold mb-3">Assign Employee To Manager</h2>

      <div className="card p-4 mb-4 border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold">Manager</label>
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
        </div>
      </div>

      {selectedManager && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
          <div className="card-header bg-white border-0 pt-3 px-4">
            <h5 className="fw-bold mb-0">Unassigned Employees</h5>
            <small className="text-muted">
              Select employees to assign to the selected manager
            </small>
          </div>

          <div className="card-body p-4">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                <div className="spinner-border text-primary" />
              </div>
            ) : unassignedEmployees.length === 0 ? (
              <div className="text-center text-muted py-5">
                No Unassigned Employees Found
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === unassignedEmployees.length && unassignedEmployees.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(unassignedEmployees.map(emp => emp.employeeCode));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                  />{" "}
                  <label className="form-label fw-semibold mb-0">Select All</label>
                </div>
                <div className="list-group">
                  {unassignedEmployees.map(emp => (
                    <div key={emp.userId} className="list-group-item d-flex align-items-center">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.employeeCode)}
                        onChange={() => toggleEmployee(emp.employeeCode)}
                        className="me-3"
                      />
                      <span className="fw-medium">{emp.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

<div className="card-footer bg-white border-0 px-4 pb-3 d-flex justify-content-end">
             <button
               className="btn btn-primary"
               onClick={handleSave}
               disabled={loading}
             >
               {loading ? "Saving..." : `Assign Selected (${selectedEmployees.length})`}
             </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default AssignEmployeeToManager;
