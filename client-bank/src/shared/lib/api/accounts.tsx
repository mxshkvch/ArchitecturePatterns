import axios from "axios";

export type AccountStatus = "ACTIVE" | "CLOSED";

export interface Account {
  id: string;
  accountNumber: string;
  userId: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  closedAt: string | null;
}

export interface AccountsResponse {
  content: Account[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}



export interface CreateAccountRequest {
  Currency: "RUB" | "USD" | "EUR";
  InitialDeposit: number;
}

export interface CreateAccountResponse extends Account {}

export interface DepositWithdrawRequest {
  Amount: number;
  Description?: string;
}

export interface DepositWithdrawResponse {
  success: boolean;
  updatedAccount: Account;
}

export interface TransferRequest {
  amountMoney: number;
}

export interface TransferResponse {
  success: boolean;
  fromAccount: Account;
  toAccount: Account;
}



const API_BASE = "http://89.23.105.66:5000/api";

const getAuthHeaders = (): { Authorization: string } => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Access token is missing");
  return { Authorization: `Bearer ${token}` };
};



export const fetchAccounts = async (page: number, size: number): Promise<AccountsResponse> => {
  const res = await axios.get<AccountsResponse>(`${API_BASE}/accounts`, {
    params: { page, size },
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchAllAccounts = async (): Promise<Account[]> => {
  const res = await axios.get<AccountsResponse>(`${API_BASE}/accounts`, {
    params: { page: 0, size: 1000 },
    headers: getAuthHeaders(),
  });
  return res.data.content;
};

export const createAccount = async (currency: "RUB" | "USD" | "EUR", initialDeposit: number): Promise<CreateAccountResponse> => {
  const req: CreateAccountRequest = { Currency: currency, InitialDeposit: initialDeposit };
  const res = await axios.post<CreateAccountResponse>(`${API_BASE}/accounts`, req, {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  return res.data;
};

export const depositToAccount = async (accountId: string, amount: number, description = ""): Promise<DepositWithdrawResponse> => {
  const req: DepositWithdrawRequest = { Amount: amount, Description: description };
  const res = await axios.post<DepositWithdrawResponse>(
    `${API_BASE}/accounts/${accountId}/deposit`,
    req,
    { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
  );
  return res.data;
};

export const withdrawFromAccount = async (accountId: string, amount: number, description = ""): Promise<DepositWithdrawResponse> => {
  const req: DepositWithdrawRequest = { Amount: amount, Description: description };
  const res = await axios.post<DepositWithdrawResponse>(
    `${API_BASE}/accounts/${accountId}/withdraw`,
    req,
    { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
  );
  return res.data;
};

export const closeAccount = async (accountId: string): Promise<Account> => {
  const res = await axios.delete<Account>(`${API_BASE}/accounts/${accountId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const transferBetweenAccounts = async (fromAccountId: string, toAccountId: string, amount: number): Promise<TransferResponse> => {
  const req: TransferRequest = { amountMoney: amount };
  const res = await axios.post<TransferResponse>(
    `${API_BASE}/accounts/${fromAccountId}/transfer/${toAccountId}`,
    req,
    { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
  );
  return res.data;
};