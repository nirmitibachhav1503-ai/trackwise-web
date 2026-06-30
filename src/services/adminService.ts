import api from "../api/axios";

const adminService = {

    getManagerEmployees: (userId: number) =>
        api.post(
            "/api/admin/Manager/get_manager_employee",
            { userid: Number(userId) }
        ),

    getManagerProjects: (userId: number) =>
        api.post(
            "/api/admin/Manager/get_manager_projects",
            { userId }
        ),

    getEmployees: () =>
        api.get(
            "/api/admin/employees"
        ),

    addEmployee: (data:any) =>
        api.post(
            "/api/admin/employees",
            data
        ),

    updateEmployee: (
        id:number,
        data:any
    ) =>
        api.put(
            `/api/admin/employees/${id}`,
            data
        ),

    deleteEmployee: (
        id:number
    ) =>
        api.delete(
            `/api/admin/employees/${id}`
        ),

    updateEmployeeRole: (id:number, role:string) =>
        api.put(
            `/api/admin/employees/${id}/role`,
            { role }
        ),

    getManagers: () =>
        api.get(
            "/api/admin/Manager"
        ),

    addManager: (data:any) =>
        api.post(
            "/api/admin/Manager",
            data
        ),

    updateManager: (
        id:number,
        data:any
    ) =>
        api.put(
            `/api/admin/Manager/${id}`,
            data
        ),

    deleteManager: (
        id:number
    ) =>
        api.delete(
            `/api/admin/Manager/${id}`
        ),

    demoteManager: (id:number) =>
        api.put(
            `/api/admin/Manager/${id}/demote`
        ),

    getUnassignedEmployees: (managerCode: string) =>
        api.post(
            "/api/admin/manager-assignment/unassigned-employees",
            { managerCode }
        ),

    assignEmployeesToManager: (
        managerCode:string,
        employeeCodes:string
    ) =>
        api.post(
            "/api/admin/manager-assignment/assign",
            { managerCode, employeeCodes }
        ),

    addManagerEmployee: (data:any) =>
        api.post(
            "/api/admin/Manager/add_manager_employee",
            data
        ),

    getProjects: () =>
        api.get(
            "/api/admin/projects"
        ),

    addProject: (data: any) =>
        api.post(
            "/api/admin/projects/add_project",
            data
        ),

    updateProject: (
        id: number,
        data: any
    ) =>
        api.put(
            `/api/admin/projects/${id}`,
            data
        ),

    deleteProject: (
        id: number
    ) =>
        api.delete(
            `/api/admin/projects/${id}`
        )
    };

export default adminService;