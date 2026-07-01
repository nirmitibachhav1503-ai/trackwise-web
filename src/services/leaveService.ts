import api from "../api/axios";

const leaveService = {

    applyLeave: (data:any) =>
        api.post(
            "/api/leave/apply",
            data
        ),

    getMyLeaves: (userId?: number) =>
        api.get(
            "/api/leave/my-leaves",
            userId ? { params: { userId } } : undefined
        ),

    getAllLeaves: () =>
        api.get(
            "/api/leave/all"
        ),

    getLeavesByUserId: (userId: number) =>
        api.get(
            `/api/leave/user/${userId}`
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