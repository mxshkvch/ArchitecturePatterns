import { safeRequest } from "./apiClient";

const API_URL = "http://89.23.105.66:5107";

export interface CreditRating {
  userId: string;
  repaymentProbability: number;
  activeCredits: number;
  paidCredits: number;
  overdueCredits: number;
  defaultedCredits: number;
  calculatedAt: string;
}

export interface Delinquency {
  creditId: string;
  userId: string;
  accountId: string;
  dueDate: string;
  remainingAmount: number;
  daysOverdue: number;
  status: "ACTIVE" | "PAID" | "OVERDUE" | "DEFAULTED";
}

export interface DelinquenciesResponse {
  content: Delinquency[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

const getAuthHeaders = (): { Authorization: string } => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Access token is missing");
  return { Authorization: `Bearer ${token}` };
};

export const fetchMyCreditRating = async (): Promise<CreditRating> => {
  const res = await safeRequest({
    method: "get",
    url: `${API_URL}/credits/rating/my`,
    headers: getAuthHeaders(),
  });

  return res.data;
};

export const fetchDelinquencies = async (page: number, size: number): Promise<DelinquenciesResponse> => {
  const res = await safeRequest({
    method: "get",
    url: `${API_URL}/credits/delinquencies/my`,
    params: { page, size },
    headers: getAuthHeaders(),
  });

  return res.data;
};