export interface Employee {

    userId: number;

    employeeCode: string;

    fullName: string;

    email: string;

    roleName: string | null;

    isAssigned?: number;

    projectNames?: string | null;
}