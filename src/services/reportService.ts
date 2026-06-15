import api from "../api/axios";

const downloadExcel = async (url: string, filename: string) => {
    const response = await api.get(url, { responseType: "blob" });
    const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

const reportService =
{
    getDailyReport:
        (reportDate:string) =>
        api.get(
            `/api/report/daily?reportDate=${reportDate}`
        ),

    getDailyRangeReport:
        (startDate: string, endDate: string) =>
        api.get(
            `/api/report/daily-range?startDate=${startDate}&endDate=${endDate}`
        ),

    exportDailyRange:
        (startDate: string, endDate: string) =>
        downloadExcel(
            `/api/report/export-daily-range?startDate=${startDate}&endDate=${endDate}`,
            `daily-report-${startDate}-${endDate}.xlsx`
        ),

    getWeeklyReport:
(
    startDate:string,
    endDate:string
)=>
    api.get(
        `/api/report/weekly?startDate=${startDate}&endDate=${endDate}`
    ),

  getMonthlyReport:
(
    month:number,
    year:number
)=>
    api.get(
        `/api/report/monthly?month=${month}&year=${year}`
    ),

    exportDaily:
        (reportDate: string) =>
        downloadExcel(
            `/api/report/export-daily?reportDate=${reportDate}`,
            `daily-report-${reportDate}.xlsx`
        ),

    exportWeekly:
        (startDate: string, endDate: string) =>
        downloadExcel(
            `/api/report/export-weekly?startDate=${startDate}&endDate=${endDate}`,
            `weekly-report-${startDate}-${endDate}.xlsx`
        ),

    exportMonthly:
        (month: number, year: number) =>
        downloadExcel(
            `/api/report/export-monthly?month=${month}&year=${year}`,
            `monthly-report-${year}-${month}.xlsx`
        ),
};

export default reportService;