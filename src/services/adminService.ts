import api from "../api/axios";

const adminService = {

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
        )
};

export default adminService;