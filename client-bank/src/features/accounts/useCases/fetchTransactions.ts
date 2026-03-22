import { transactionsService } from "../../../shared/lib/services/transactionsService";

export const fetchTransactionsForAccount = async (accountId: string, page: number, size: number) => {
  try {
    const transactions = await transactionsService.getTransactions(accountId, page, size);
    const totalPages = await transactionsService.getTotalPages(accountId, page, size);
    return { transactions, totalPages };
  } catch (error) {
    console.error("Ошибка при загрузке транзакций:", error);
    throw error;
  }
};