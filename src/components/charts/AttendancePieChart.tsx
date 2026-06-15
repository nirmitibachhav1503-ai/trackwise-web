import {
    PieChart,
    Pie,
    Tooltip,
    Cell
}
from "recharts";

interface Props
{
    present:number;
    absent:number;
}

function AttendancePieChart({
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
                label
            >

                <Cell fill="#198754" />

                <Cell fill="#dc3545" />

            </Pie>

            <Tooltip />

        </PieChart>

    );
}

export default AttendancePieChart;