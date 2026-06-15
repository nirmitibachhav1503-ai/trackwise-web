export interface LoginRequest {
  employeeCode: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}