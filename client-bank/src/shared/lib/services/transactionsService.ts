import { getTransactions, type Transaction } from "../api/transactionsHistory";

export const transactionsService = {
  getTransactions: async (accountId: string, page: number, size: number): Promise<Transaction[]> => {
    const data = await getTransactions(accountId, page, size);
    return data.content;
  },

  getTotalPages: async (accountId: string, page: number, size: number): Promise<number> => {
    const data = await getTransactions(accountId, page, size);
    return data.page.totalPages;
  },
};