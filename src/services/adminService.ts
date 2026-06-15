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
        )
};

export default adminService;