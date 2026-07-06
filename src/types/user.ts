export interface User {
  userId: number;
  fullName: string;
  role: string;
  employeeCode: string;
  isTeamLeader?: boolean;
  leaderProjectNames?: string[];
}