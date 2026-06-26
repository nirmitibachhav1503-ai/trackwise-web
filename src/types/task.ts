export interface Task {
    taskId: number;
    userId: number;
    employeeName: string;
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    dueDate: string;
    status: "Pending" | "In Progress" | "Completed";
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
    userId: number;
    title: string;
    description: string;
    priority: string;
    dueDate: string;
}
