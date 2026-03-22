import { useState, useEffect } from "react";
import type { Account, AccountsResponse } from "../../../shared/lib/api/accounts";
import {  fetchAccounts, fetchAllAccounts, createAccount, depositToAccount, withdrawFromAccount, closeAccount, transferBetweenAccounts } from "../../../shared/lib/api/accounts";

import { fetchSettings, updateSettings, type AppSettings } from "../../../shared/lib/api/settings";

export const useAccountsPage = (pageSize: number) => {
  const [accountsResponse, setAccountsResponse] = useState<AccountsResponse | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  

  const loadAccounts = async (page: number) => {
    const data = await fetchAccounts(page, pageSize);
    setAccountsResponse(data);
  };

  const loadAllAccounts = async () => {
    const all = await fetchAllAccounts();
    setAllAccounts(all);
  };

  const loadSettings = async () => {
    try {
      const appSettings = await fetchSettings();
      setSettings(appSettings);
    } catch (err) {
      console.error("Ошибка загрузки настроек:", err);
    }
  };

  useEffect(() => {
    loadAccounts(currentPage);
    loadAllAccounts();
    loadSettings();
    const interval = setInterval(() => loadAccounts(currentPage), 60_000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const refreshAccounts = async () => loadAccounts(currentPage);

  const handleCreateAccount = async (currency: "RUB" | "USD" | "EUR", initialDeposit: number) => {
    await createAccount(currency, initialDeposit);
    await refreshAccounts();
    await loadAllAccounts();
  };

  const handleDeposit = async (accountId: string, amount: number) => {
    await depositToAccount(accountId, amount);
    await refreshAccounts();
    await loadAllAccounts();
  };

  const handleWithdraw = async (accountId: string, amount: number) => {
    await withdrawFromAccount(accountId, amount);
    await refreshAccounts();
    await loadAllAccounts();
  };

  const handleCloseAccount = async (accountId: string, balance: number) => {
    if (balance > 0) throw new Error("На счете есть средства");
    await closeAccount(accountId);
    await refreshAccounts();
    await loadAllAccounts();
  };

  const handleTransfer = async (fromAccountId: string, toAccountId: string, amount: number) => {
    await transferBetweenAccounts(fromAccountId, toAccountId, amount);
    await refreshAccounts();
    await loadAllAccounts();
  };

  const toggleHideAccount = async (accountId: string) => {
    if (!settings) return;

    const newHidden = settings.hiddenAccountIds.includes(accountId)
      ? settings.hiddenAccountIds.filter(id => id !== accountId)
      : [...settings.hiddenAccountIds, accountId];

    setSettings({ ...settings, hiddenAccountIds: newHidden });

    try {
      const updated = await updateSettings(settings.theme, newHidden);
      setSettings(updated);
    } catch (err) {
      console.error("Ошибка обновления настроек:", err);
      alert("Не удалось обновить скрытые счета");
      setSettings(settings);
    }
  };

  const accountsWithHidden = accountsResponse?.content.map(account => ({
    ...account,
    isHidden: settings?.hiddenAccountIds.includes(account.id) ?? false,
  })) ?? [];

  return {
    accountsResponse,
    accounts: accountsWithHidden,
    allAccounts,
    currentPage,
    setCurrentPage,
    refreshAccounts,
    handleCreateAccount,
    handleDeposit,
    handleWithdraw,
    handleCloseAccount,
    handleTransfer,
    toggleHideAccount,
  };
};