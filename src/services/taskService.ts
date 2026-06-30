import api from "../api/axios";
import type { TaskPayload } from "../types/task";

const taskService = {
    getDashboard: () =>
        api.get(
            "/api/task/dashboard"
        ),

    assignTask: (
        data: TaskPayload
    ) =>
        api.post(
            "/api/task/assign-task",
            data
        ),

    getAllTasks: (data?: Record<string, unknown> | Record<string, string> | number) =>
        api.post(
            "/api/task/task-list",
            typeof data === "number" ? { userId: data } : data || {}
        ),

    getMyTasks: (userId: number, status?: string | null, priority?: string | null, pageSize?: number, pageNo?: number) =>
        api.post(
            "/api/task/my-tasks",
            { userId, status, priority, pageSize, pageNo }
        ),

    updateTaskStatus: (
        id: number,
        status: string
    ) =>
        api.post(
            `/api/task/update-status/${id}`,
            { status }
        ),

    deleteTask: (
        id: number
    ) =>
        api.delete(
            `/api/task/${id}`
        ),

    updateTask: (
        id: number,
        data: { employeeCode: string; projectId: number; description: string; priority: string; }
    ) =>
        api.put(
            `/api/task/${id}`,
            data
        )
};

export default taskService;
