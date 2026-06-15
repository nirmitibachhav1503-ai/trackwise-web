import {
    useState
} from "react";

import reportService
from "../../services/reportService";

function MonthlyReport()
{
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
        const response =
            await reportService
            .getMonthlyReport(
                month,
                year
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