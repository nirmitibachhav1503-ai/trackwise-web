import {
    useEffect,
    useState
}
from "react";

import leaveService
from "../../services/leaveService";
import type { Leave } from "../../types/leave";



function MyLeaves()
{
    const [leaves,
        setLeaves]
        = useState<
        Leave[]
        >([]);

    const [fromDate,
        setFromDate]
        = useState("");

    const [toDate,
        setToDate]
        = useState("");

    const [reason,
        setReason]
        = useState("");

    useEffect(() =>
    {
        loadLeaves();
    }, []);

    const loadLeaves =
        async () =>
    {
        const response =
            await leaveService
            .getMyLeaves();

        setLeaves(
            response.data
        );
    };

    const applyLeave =
        async () =>
    {
        await leaveService
            .applyLeave({
                fromDate,
                toDate,
                reason
            });

        loadLeaves();

        setFromDate("");
        setToDate("");
        setReason("");
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
                                    leave.fromDate
                                    }
                                </td>

                                <td>
                                    {
                                    leave.toDate
                                    }
                                </td>

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