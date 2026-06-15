import {
    useEffect,
    useState
}
from "react";

import reportService
from "../../services/reportService";

import WeeklyHoursChart
from "../../components/charts/WeeklyHoursChart";

import MonthlyHoursChart
from "../../components/charts/MonthlyHoursChart";

function Analytics()
{
    const [weekly,
        setWeekly]
        = useState<any[]>([]);

    const [monthly,
        setMonthly]
        = useState<any[]>([]);

    useEffect(() =>
    {
        loadCharts();
    }, []);

    const loadCharts =
        async () =>
    {
        const weeklyResponse =
            await reportService
            .getWeeklyReport(
                "2026-06-01",
                "2026-06-06"
            );

        const monthlyResponse =
            await reportService
            .getMonthlyReport(
                6,
                2026
            );

        setWeekly(
            weeklyResponse.data
        );

        setMonthly(
            monthlyResponse.data
        );
    };

    return (

        <div>

            <h2>
                Analytics
            </h2>

            <div
                className="
                card
                p-3
                mt-3"
            >

                <h5>
                    Weekly Hours
                </h5>

                <WeeklyHoursChart
                    data={weekly}
                />

            </div>

            <div
                className="
                card
                p-3
                mt-4"
            >

                <h5>
                    Monthly Hours
                </h5>

                <MonthlyHoursChart
                    data={monthly}
                />

            </div>

        </div>

    );
}

export default Analytics;