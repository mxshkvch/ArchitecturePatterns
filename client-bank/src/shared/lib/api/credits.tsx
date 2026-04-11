// import axios from "axios";
import { safeRequest } from "./apiClient";
export type CreditStatus = "ACTIVE" | "PAID" | "OVERDUE" | "DEFAULTED";

export interface Credit {
  id: string;
  userId: string;
  accountId: string;
  tariffId: string;
  principal: number;
  remainingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: CreditStatus;
}

export interface CreditsResponse {
  content: Credit[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface Tariff {
  id: string;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  status: CreditStatus;
}

export interface TariffsResponse {
  content: Tariff[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ApplyCreditRequest {
  tariffId: string;
  accountId: string;
  amount: number;
  term: number;
}

export interface ApplyCreditResponse {
  id: string;
  userId: string;
  accountId: string;
  tariffId: string;
  principal: number;
  remainingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: CreditStatus;
}

export interface PayCreditRequest {
  amount: number;
}

export interface PayCreditResponse {
  success: boolean;
  updatedCredit: Credit;
}



const API_BASE = "http://89.23.105.66:5107";

const getAuthHeaders = (): { Authorization: string } => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Access token is missing");
  return { Authorization: `Bearer ${token}` };
};


export const fetchMyCredits = async (page: number, size: number): Promise<CreditsResponse> => {
  const res = await safeRequest({
    method: "GET",
    url: `${API_BASE}/credits/my`,
    params: { page, size },
    headers: getAuthHeaders(),
  });

  return res.data;
};

// export const payCredit = async ( creditId: string, amount: number ): Promise<PayCreditResponse> => {
//   const res = await axios.post<PayCreditResponse>(
//     `${API_BASE}/credits/${creditId}/pay`,
//     { amount } as PayCreditRequest,
//     { headers: getAuthHeaders() }
//   );
//   return res.data;
// };

export const fetchTariffs = async (page = 1, size = 10): Promise<Tariff[]> => {
  const res = await safeRequest({
    method: "GET",
    url: `${API_BASE}/credits/tariffs`,
    params: { page, size },
    headers: getAuthHeaders(),
  });

  return res.data.content;
};

export const applyCredit = async ( tariffId: string, accountId: string, amount: number, term: number): Promise<ApplyCreditResponse> => {
  const res = await safeRequest({
    method: "POST",
    url: `${API_BASE}/credits/apply`,
    data: { tariffId, accountId, amount, term },
    headers: getAuthHeaders(),
  });

  return res.data;
};