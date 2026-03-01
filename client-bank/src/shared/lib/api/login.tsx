import axios from "axios";

const API_BASE = "http://localhost:60882/api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE}/auth/login`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};