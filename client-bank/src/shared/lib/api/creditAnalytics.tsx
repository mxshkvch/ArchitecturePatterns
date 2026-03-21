import axios from "axios";

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
  status: string;
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


const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const fetchMyCreditRating = async () => {
  const res = await axios.get(`${API_URL}/credits/rating/my`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const fetchDelinquencies = async (page: number, size: number) => {
  const res = await axios.get(
    `${API_URL}/credits/delinquencies/my?page=${page}&size=${size}`,
    {
      headers: getAuthHeader(),
    }
  );
  return res.data;
};