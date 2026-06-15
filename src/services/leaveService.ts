import api from "../api/axios";

const leaveService = {

    applyLeave: (data:any) =>
        api.post(
            "/api/leave/apply",
            data
        ),

    getMyLeaves: () =>
        api.get(
            "/api/leave/my-leaves"
        ),

    getAllLeaves: () =>
        api.get(
            "/api/leave/all"
        ),

    approveLeave: (
        leaveId:number
    ) =>
        api.post(
            `/api/leave/approve/${leaveId}`
        ),

    rejectLeave: (
        leaveId:number
    ) =>
        api.post(
            `/api/leave/reject/${leaveId}`
        )
};

export default leaveService;