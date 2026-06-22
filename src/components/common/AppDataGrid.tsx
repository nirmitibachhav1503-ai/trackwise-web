import {
    DataGrid,
    type GridColDef
}
from "@mui/x-data-grid";

interface Props
{
    rows:any[];

    columns:GridColDef[];

    loading?:boolean;

    getRowClassName?: (params:any) => string;

    hideFooterPagination?: boolean;
}

function AppDataGrid({
    rows,
    columns,
    loading,
    getRowClassName,
    hideFooterPagination
}:Props)
{
    const getStableRowId =
        (row:any) =>
    {
        const knownId =
            row.id ||
            row.holidayId ||
            row.userId ||
            row.employeeId ||
            row.leaveId ||
            row.reportId;

        if(knownId)
        {
            return knownId;
        }

        const reportId =
        [
            row.employeeCode,
            row.employeeName,
            row.reportDate,
            row.inTime,
            row.outTime,
            row.totalHours,
            row.totalWorkingHours,
            row.totalMonthlyHours
        ]
        .filter(Boolean)
        .join("-");

        return reportId || JSON.stringify(row);
    };

    return (

        <div
            style={{
                height:600,
                width:"100%"
            }}
        >

            <DataGrid
                getRowId={
                    getStableRowId
                }
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[
                    10,
                    25,
                    50
                ]}
                getRowClassName={getRowClassName}
                hideFooterPagination={hideFooterPagination}
                initialState={{
                    pagination:{
                        paginationModel:{
                            pageSize:10
                        }
                    }
                }}
            />

        </div>

    );
}

export default AppDataGrid;
