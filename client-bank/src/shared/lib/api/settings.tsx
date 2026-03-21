import axios from "axios";

export type AppSettings = {
  userId: string;
  applicationType: "CLIENT";
  theme: "LIGHT" | "DARK";
  hiddenAccountIds: string[];
  updatedAt: string;
};

const API_BASE = "http://89.23.105.66:5208/api/bff";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export const fetchSettings = async (): Promise<AppSettings> => {
  const { data } = await axios.get<AppSettings>(`${API_BASE}/settings`, {
    headers: getAuthHeaders(),
    params: { applicationType: "CLIENT" },
  });
  return data;
};

export const updateSettings = async (hiddenAccountIds: string[]): Promise<AppSettings> => {
  const { data } = await axios.put<AppSettings>(
    `${API_BASE}/settings`,
    { applicationType: "CLIENT", hiddenAccountIds },
    { headers: getAuthHeaders() }
  );
  return data;
};