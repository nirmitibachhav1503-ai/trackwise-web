import api from "../api/axios";
import type { TaskDashboard, TaskPayload } from "../types/task";

const taskService = {
    getDashboard: () =>
        api.get(
            "/api/task/dashboard"
        ),

    assignTask: (
        data: TaskPayload
    ) =>
        api.post(
            "/api/task/assign",
            data
        ),

    getAllTasks: (
        params?: Record<string, string>
    ) =>
        api.get(
            "/api/task/task-list",
            { params }
        ),

    getMyTasks: () =>
        api.get(
            "/api/task/my-tasks"
        ),

    updateTaskStatus: (
        id: number,
        status: string
    ) =>
        api.post(
            `/api/task/update-status/${id}`,
            { status }
        )
};

export default taskService;
