import {
    PieChart,
    Pie,
    Cell,
    Tooltip
}
from "recharts";

interface Props
{
    present:number;
    absent:number;
}

function AttendanceChart({
    present,
    absent
}:Props)
{
    const data =
    [
        {
            name:"Present",
            value:present
        },
        {
            name:"Absent",
            value:absent
        }
    ];

    return (

        <PieChart
            width={400}
            height={300}
        >

            <Pie
                data={data}
                dataKey="value"
                outerRadius={100}
            >

                <Cell fill="#28a745" />

                <Cell fill="#dc3545" />

            </Pie>

            <Tooltip />

        </PieChart>

    );
}

export default AttendanceChart;