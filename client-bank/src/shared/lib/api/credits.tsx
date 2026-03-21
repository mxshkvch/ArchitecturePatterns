import axios from "axios";

export type Credit = {
  id: string;
  userId: string;
  accountId: string;
  tariffId: string;
  principal: number;
  remainingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "CLOSED";
};

export type CreditsResponse = {
  content: Credit[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type TariffStatus = "ACTIVE" | "PAID" | "OVERDUE" | "DEFAULTED";

export type Tariff = {
  id: string;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  status: TariffStatus;
};

const API_BASE = "http://89.23.105.66:5107";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchMyCredits = async (page: number, size: number): Promise<CreditsResponse> => {
  const res = await axios.get<CreditsResponse>(`${API_BASE}/credits/my`, {
    params: { page, size },
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const payCredit = async (creditId: string, amount: number) => {
  await axios.post(
    `${API_BASE}/credits/${creditId}/pay`,
    { amount },
    { headers: getAuthHeaders() }
  );
};

export const fetchTariffs = async (page = 1, size = 10): Promise<Tariff[]> => {
  const res = await axios.get(`${API_BASE}/credits/tariffs`, {
    params: { page, size },
    headers: getAuthHeaders(),
  });
  return res.data.content;
};

export const applyCredit = async (tariffId: string, amount: number, term: number) => {
  const res = await axios.post(
    `${API_BASE}/credits/apply`,
    { tariffId, amount, term },
    { headers: getAuthHeaders() }
  );
  return res.data;
};