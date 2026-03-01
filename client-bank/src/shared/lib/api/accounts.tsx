import axios from "axios";

export type Account = {
  id: string;
  accountNumber: string;
  userId: string;
  balance: number;
  currency: string;
  status: "ACTIVE" | "CLOSED";
  createdAt: string;
  closedAt: string | null;
};

export type AccountsResponse = {
  content: Account[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

const API_BASE = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAccounts = async (page: number, size: number): Promise<AccountsResponse> => {
  const response = await axios.get<AccountsResponse>(`${API_BASE}/accounts`, {
    params: { page, size },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createAccount = async (currency: "RUB" | "USD", initialDeposit: number) => {
  const response = await axios.post(`${API_BASE}/accounts`, {
    Currency: currency,
    InitialDeposit: initialDeposit,
  }, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

export const depositToAccount = async (accountId: string, amount: number, description = "") => {
  const response = await axios.post(`${API_BASE}/accounts/${accountId}/deposit`, {
    Amount: amount,
    Description: description,
  }, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

export const withdrawFromAccount = async (accountId: string, amount: number, description = "") => {
  const response = await axios.post(`${API_BASE}/accounts/${accountId}/withdraw`, {
    Amount: amount,
    Description: description,
  }, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

export const closeAccount = async (accountId: string) => {
  const response = await axios.delete(`${API_BASE}/accounts/${accountId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};