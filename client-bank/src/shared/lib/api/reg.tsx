import axios from "axios";

const API_BASE = "http://localhost:60882/api";

export type RegisterRequest = {
  email: string;
  password: string;
  role: "CLIENT" | "ADMIN";
  firstName: string;
  lastName: string;
  phone: string;
};

export type RegisterResponse = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const res = await axios.post(`${API_BASE}/auth/register`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};