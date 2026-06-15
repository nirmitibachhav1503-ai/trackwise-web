import {
    ResponsiveContainer,
    BarChart,
    Bar,
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

function WeeklyHoursChart({
    data
}:Props)
{
    return (

        <ResponsiveContainer
            width="100%"
            height={300}
        >

            <BarChart data={data}>

                <CartesianGrid
                    strokeDasharray="3 3"
                />

                <XAxis
                    dataKey="employeeName"
                />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="totalWorkingHours"
                />

            </BarChart>

        </ResponsiveContainer>

    );
}

export default WeeklyHoursChart;