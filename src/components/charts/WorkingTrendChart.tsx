import {
    ResponsiveContainer,
    LineChart,
    Line,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
}
from "recharts";

interface Props
{
    data:any[];
}

function WorkingTrendChart({
    data
}:Props)
{
    return (

        <ResponsiveContainer
            width="100%"
            height={300}
        >

            <LineChart
                data={data}
            >

                <CartesianGrid
                    strokeDasharray="3 3"
                />

                <XAxis
                    dataKey="date"
                />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#0d6efd"
                />

            </LineChart>

        </ResponsiveContainer>

    );
}

export default WorkingTrendChart;