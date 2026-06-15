import api from "../api/axios";

const dashboardService = {

    getAdminDashboard: () =>
        api.get(
            "/api/dashboard/admin"
        ),

    getEmployeeDashboard: () =>
        api.get(
            "/api/dashboard/employee"
        ),

    getAttendanceChart: () =>
        api.get(
            "/api/dashboard/attendance-chart"
        ),

    getWorkingTrend: () =>
        api.get(
            "/api/dashboard/working-trend"
        )
};

export default dashboardService;