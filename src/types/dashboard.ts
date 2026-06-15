export interface AdminDashboard {

    totalEmployees: number;

    presentEmployees: number;

    absentEmployees: number;

    overtimeEmployees: number;

    deficitEmployees: number;

    totalWorkingHours: string;

    attendancePercentage: number;
}

export interface EmployeeDashboard {

    employeeName: string;

    todayStatus: string;

    inTime: string;

    outTime: string;

    workingHours: string;

    extraHours: string;

    expectedLogoutTime: string;

    weeklyHours: string;

    monthlyHours: string;
}