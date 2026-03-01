import { Routes, Route, Navigate } from "react-router-dom";
import { RegisterPage } from "../pages/registerPage/registerPage";
import { LoginPage } from "../pages/authPage/loginPage";
import { AccountsPage } from "../pages/accountsPage/accountsPage";
import { MainLayout } from "../shared/ui/layout/mainLayout";
import { AccountTransactionsPage } from "../pages/accountTransactionsPage/accountTransactionsPage";
import { CreditsPage } from "../pages/creditsPage/creditsPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/accounts" />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/:accountId/transactions" element={<AccountTransactionsPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="*" element={<h1>Страница не найдена</h1>} />
      </Route>
    </Routes>
  );
};