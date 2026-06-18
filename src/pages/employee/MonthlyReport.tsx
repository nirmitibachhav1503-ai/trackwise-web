import {
    useState
} from "react";

import reportService
from "../../services/reportService";
import { useAuth }
from "../../context/AuthContext";

function MonthlyReport()
{
    const { user }
    = useAuth();

    const storedUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null);

    const userId = storedUser?.userId;

    const [month,
        setMonth]
        = useState(1);

    const [year,
        setYear]
        = useState(
            new Date()
            .getFullYear()
        );

    const [data,
        setData]
        = useState<any[]>([]);

    const weekColumns = data.length > 0
        ? Object.keys(data[0]).filter(k => k.match(/^week\d+$/)).sort()
        : ["week1", "week2", "week3", "week4"];

    const search =
        async () =>
    {
        if (!userId) {
            showError("User not found. Please login again.");
            return;
        }
        const response =
            await reportService
            .getMonthlyReport(
                month,
                year,
                userId
            );

        setData(
            response.data
        );
    };

    return (
        <div>

            <h2>
                Monthly Report
            </h2>

            <div className="row">

                <div className="col-md-3">

                    <input
                        type="month"
                        className="form-control"
                        value={`${year}-${String(month).padStart(2, "0")}`}
                        onChange={(e) => {
                            const [y, m] = e.target.value.split("-");
                            setYear(Number(y));
                            setMonth(Number(m));
                        }}
                    />

                </div>

                <div className="col-md-2">

                    <button
                        className="btn btn-primary"
                        onClick={search}
                    >
                        Search
                    </button>

                </div>

            </div>

            <table
                className="
                table
                table-bordered
                mt-4"
            >

                <thead>

                <tr>

                    {weekColumns.map(w => (
                        <th key={w}>{w.replace("week", "Week ")}</th>
                    ))}

                    <th>
                        Total
                    </th>

                    <th>
                        Required Hours
                    </th>

                    <th>
                        Extra Hours
                    </th>

                </tr>

                </thead>

                <tbody>

                {
                    data.map(
                        (
                            item:any,
                            index
                        ) =>
                        (
                            <tr
                                key={index}
                            >

                                {weekColumns.map(w => (
                                    <td key={w}>{item[w]}</td>
                                ))}
                                <td>{item.totalWorkingHours}</td>
                                <td>{item.requiredHours || "-"}</td>
                                <td>{item.extraHours || "-"}</td>

                            </tr>
                        )
                    )
                }

                </tbody>

            </table>

        </div>
    );
}

export default MonthlyReport;
