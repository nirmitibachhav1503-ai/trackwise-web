export interface Task {
    taskId: number;
    userId: number;
    employeeName: string;
    projectName: string;
    taskDescription: string;
    priority: "High" | "Medium" | "Low";
    reportDate: string;
    status: "Pending" | "In Progress" | "In Review" | "Resolved" | "Resolved And Closed";
    assignTo?: string;
    projectId?: number;
    employeeCode?: string;
    assignedDate?: string;
}

export interface TaskDashboard {
    totalEmployees: number;
    totalAssignedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
}

export interface TaskPayload {
    employeeCode: string;
    projectId: number;
    description: string;
    priority: string;
}
