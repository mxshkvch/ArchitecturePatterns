import { getTransactions, type TransactionsResponse } from "../api/transactionsHistory";

export const transactionsService = {
  getTransactions: async (accountId: string, page: number, size: number): Promise<TransactionsResponse> => {
    return await getTransactions(accountId, page, size);
  },
};