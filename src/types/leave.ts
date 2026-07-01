export interface Leave {

    leaveId: number;

    employeeName: string;

    fromDate: string;

    toDate: string;

    reason: string;

    status: string;

    leaveType?: string | null;

    createdDate?: string | null;
}