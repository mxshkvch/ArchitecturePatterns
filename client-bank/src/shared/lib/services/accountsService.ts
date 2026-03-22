import * as accountsApi from "../api/accounts";

export const accountsService = {
  fetchAccounts: async (page: number, size: number) => {
    return await accountsApi.fetchAccounts(page, size);
  },

  fetchAllAccounts: async () => {
    return await accountsApi.fetchAllAccounts();
  },

  createAccount: async (currency: "RUB" | "USD" | "EUR", initialDeposit: number) => {
    return await accountsApi.createAccount(currency, initialDeposit);
  },

  depositToAccount: async (accountId: string, amount: number) => {
    return await accountsApi.depositToAccount(accountId, amount);
  },

  withdrawFromAccount: async (accountId: string, amount: number) => {
    return await accountsApi.withdrawFromAccount(accountId, amount);
  },

  transferBetweenAccounts: async (fromId: string, toId: string, amount: number) => {
    return await accountsApi.transferBetweenAccounts(fromId, toId, amount);
  },

  closeAccount: async (accountId: string) => {
    return await accountsApi.closeAccount(accountId);
  }
};