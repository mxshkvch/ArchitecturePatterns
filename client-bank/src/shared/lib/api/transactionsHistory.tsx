import axios from "axios";

export type Transaction = {
  id: string;
  accountId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
};

export type TransactionsResponse = {
  content: Transaction[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

const API_BASE = "http://localhost:5000/api";

export const getTransactions = async (
  accountId: string,
  page: number,
  size: number
): Promise<TransactionsResponse> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get<TransactionsResponse>(
    `${API_BASE}/accounts/${accountId}/transactions`,
    {
      params: { page, size },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return response.data;
};