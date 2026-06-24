import {
    useState
} from "react";

import reportService
from "../../services/reportService";
import holidayService
from "../../services/holidayService";
import { useAuth }
from "../../context/AuthContext";
import { showError }
from "../../utils/toast";

const toMinutes = (hhmm: string): number => {
    if (!hhmm || !hhmm.includes(":")) return 0;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

const toHHMM = (mins: number): string => {
    const sign = mins < 0 ? "-" : "";
    const abs = Math.abs(mins);
    return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
};

const isWorkingDay = (date: Date): boolean => {
    if (date.getDay() === 0) return false;
    if (date.getDay() === 6) {
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        if (weekOfMonth === 1 || weekOfMonth === 3) return false;
    }
    return true;
};

const getDateKey = (val: string | null): string => val ? val.slice(0, 10) : "";

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

    const [holidayDates,
        setHolidayDates]
        = useState<Set<string>>(new Set());

    const monthlyHolidayCount =
        Array.from(holidayDates)
        .filter(dateKey => {
            const date = new Date(dateKey + "T00:00:00");
            return date.getFullYear() === year && date.getMonth() + 1 === month && isWorkingDay(date);
        })
        .length;

    const adjustedData =
        data.map(item => {
            const requiredMinutes = Math.max(0, toMinutes(item.requiredHours) - monthlyHolidayCount * 9 * 60);
            const totalMinutes = toMinutes(item.totalWorkingHours);
            return {
                ...item,
                requiredHours: toHHMM(requiredMinutes),
                extraHours: toHHMM(totalMinutes - requiredMinutes)
            };
        });

    const weekColumns = adjustedData.length > 0
        ? Object.keys(adjustedData[0]).filter(k => k.match(/^week\d+$/)).sort()
        : ["week1", "week2", "week3", "week4"];

    const search =
        async () =>
    {
        if (!userId) {
            showError("User not found. Please login again.");
            return;
        }
        try {
            const [response, holidaysResponse] =
                await Promise.all([
                    reportService
                    .getMonthlyReport(
                        month,
                        year,
                        userId
                    ),
                    holidayService
                    .getHolidays(year)
                ]);

            const holidays = Array.isArray(holidaysResponse.data) ? holidaysResponse.data : [];

            setHolidayDates(
                new Set(holidays.map((h: any) => getDateKey(h.holidayDate)))
            );

            setData(
                Array.isArray(response.data) ? response.data : response.data ? [response.data] : []
            );
        } catch {
            showError("Unable to load monthly report");
        }
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
                    adjustedData.map(
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
