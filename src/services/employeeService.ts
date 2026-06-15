import api from "../api/axios";

export interface ManualAttendanceEntry {
    attendanceDate: string;
    time: string;
    entryTime: string;
    inTime?: string;
    outTime?: string;
    lunchStart?: string;
    lunchEnd?: string;
    breakStart?: string;
    breakEnd?: string;
    checkInStatus?: "ON_TIME" | "LATE";
    isLate?: boolean;
    lateMarkLimit?: number;
    halfDayDeductionAfterLateMarks?: number;
}

const employeeService = {

    getDashboard: () =>
        api.get(
            "/api/dashboard/employee"
        ),

    getTodayAttendance: (date: string) =>
        api.get(
            `/api/employee/attendance?date=${date}`
        ),

    getLateCount: () =>
        api.get(
            "/api/employee/late-count"
        ),

    checkIn: (
        data?: ManualAttendanceEntry
    ) =>
        api.post(
            "/api/employee/checkin",
            data
        ),

    lunchStart: (
        data?: ManualAttendanceEntry
    ) =>
        api.post(
            "/api/employee/lunch-start",
            data
        ),

    lunchEnd: (
        data?: ManualAttendanceEntry
    ) =>
        api.post(
            "/api/employee/lunch-end",
            data
        ),

    breakStart: (
        data?: ManualAttendanceEntry
    ) =>
        api.post(
            "/api/employee/break-start",
            data
        ),

    breakEnd: (
        data?: ManualAttendanceEntry
    ) =>
        api.post(
            "/api/employee/break-end",
            data
        ),

    checkOut: (
        data?: ManualAttendanceEntry
    ) =>
        api.post(
            "/api/employee/checkout",
            data
        )
};

export default employeeService;
