import { transactionsService } from "../../../shared/lib/services/transactionsService";

export const fetchTransactionsForAccount = async (
  accountId: string,
  page: number,
  size: number
) => {
  try {
    const data = await transactionsService.getTransactions(accountId, page, size);

    return {
      transactions: data.content,
      totalPages: data.page.totalPages,
    };
  } catch (error) {
    console.error("Ошибка при загрузке транзакций:", error);
    throw error;
  }
};