export interface EmployeeDashboard {

    inTime: string;

    outTime: string;

    actualBreak: string;

    actualLunch: string;

    workingHours: string;

    extraHours: string;

    weeklyHours: string;

    monthlyHours: string;
}

export interface ManagerDashboard {

    totalTeamMembers: number;

    pendingTasks: number;

    inProgressTasks: number;

    completedTasks: number;

    teamWorkingHours: string;
}