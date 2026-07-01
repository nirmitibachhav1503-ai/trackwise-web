import {
    useEffect,
    useState
}
from "react";

import leaveService
from "../../services/leaveService";
import type { Leave } from "../../types/leave";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError } from "../../utils/toast";



function MyLeaves()
{
    const { user } = useAuth();
    const storedUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null);
    const userId = storedUser?.userId;

    const [leaves,
        setLeaves]
        = useState<
        Leave[]
        >([]);

    const [leaveType, setLeaveType] = useState("Casual Leave");
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

    const [fromDate,
        setFromDate]
        = useState("");

    const [toDate,
        setToDate]
        = useState("");

    const [reason,
        setReason]
        = useState("");

    const loadLeaves = async () => {
        if (!userId) return;
        try {
            const response = await leaveService.getMyLeaves(userId);
            setLeaves(Array.isArray(response.data) ? response.data : []);
        } catch {
            showError("Unable to load leaves");
        }
    };

    useEffect(() =>
    {
        loadLeaves();
    }, []);

    const applyLeave =
        async () =>
    {
        if (!fromDate || !toDate || !reason) {
            showError("Please fill all required fields");
            return;
        }
        try {
            await leaveService
                .applyLeave({
                    userId,
                    leaveType,
                    fromDate,
                    toDate,
                    reason
                });
            showSuccess("Leave applied successfully");
            setLeaveType("Casual Leave");
            setFromDate("");
            setToDate("");
            setReason("");
        } catch {
            showError("Unable to apply leave");
            return;
        }
        loadLeaves();
    };

    return (
        <div>

            <h2>
                My Leaves
            </h2>

            <div
                className="
                card
                p-3
                mt-3"
            >

                <h5>
                    Apply Leave
                </h5>

                <select
                    className="form-select mt-2"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                >
                    {LEAVE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <input
                    type="date"
                    className="
                    form-control
                    mt-2"
                    value={fromDate}
                    onChange={(e)=>
                        setFromDate(
                            e.target.value
                        )}
                />

                <input
                    type="date"
                    className="
                    form-control
                    mt-2"
                    value={toDate}
                    onChange={(e)=>
                        setToDate(
                            e.target.value
                        )}
                />

                <textarea
                    className="
                    form-control
                    mt-2"
                    placeholder="
                    Reason"
                    value={reason}
                    onChange={(e)=>
                        setReason(
                            e.target.value
                        )}
                />

                <button
                    className="
                    btn
                    btn-primary
                    mt-3"
                    onClick={
                        applyLeave
                    }
                >
                    Apply Leave
                </button>

            </div>

            <table
                className="
                table
                table-bordered
                mt-4"
            >

                <thead>

                    <tr>

                        <th>
                            Leave Type
                        </th>

                        <th>
                            From
                        </th>

                        <th>
                            To
                        </th>

                        <th>
                            Reason
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

                {
                    leaves.map(
                        (leave) =>
                        (
                            <tr
                                key={
                                    leave.leaveId
                                }
                            >

                                <td>
                                    {
                                    leave.leaveType || "Casual Leave"
                                    }
                                </td>

                                <td>{leave.fromDate?.split("T")[0]}</td>
                                <td>{leave.toDate?.split("T")[0]}</td>

                                <td>
                                    {
                                    leave.reason
                                    }
                                </td>

                                <td>
                                    {
                                    leave.status
                                    }
                                </td>

                            </tr>
                        )
                    )
                }

                </tbody>

            </table>

        </div>
    );
}

export default MyLeaves;