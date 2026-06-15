import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Tooltip,
    XAxis,
    YAxis
}
from "recharts";

interface Props
{
    data:any[];
}

function PerformanceChart({
    data
}:Props)
{
    return (

        <ResponsiveContainer
            width="100%"
            height={300}
        >

            <AreaChart
                data={data}
            >

                <XAxis
                    dataKey="employeeName"
                />

                <YAxis />

                <Tooltip />

                <Area
                    dataKey="extraHours"
                />

            </AreaChart>

        </ResponsiveContainer>

    );
}

export default PerformanceChart;