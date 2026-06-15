import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
}
from "recharts";

interface Props
{
    data:any[];
}

function MonthlyHoursChart({
    data
}:Props)
{
    return (

        <ResponsiveContainer
            width="100%"
            height={300}
        >

            <LineChart data={data}>

                <CartesianGrid
                    strokeDasharray="3 3"
                />

                <XAxis
                    dataKey="employeeName"
                />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="totalMonthlyHours"
                />

            </LineChart>

        </ResponsiveContainer>

    );
}

export default MonthlyHoursChart;