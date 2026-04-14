import { Routes, Route, Navigate } from "react-router-dom";
import { RegisterPage } from "../pages/registerPage/registerPage";
import { LoginPage } from "../pages/authPage/loginPage";
import { AccountsPage } from "../pages/accountsPage/accountsPage";
import { MainLayout } from "../shared/ui/layout/mainLayout";
import { AccountTransactionsPage } from "../pages/accountTransactionsPage/accountTransactionsPage";
import { CreditsPage } from "../pages/creditsPage/creditsPage";
import { CreditAnalyticsPage } from "../pages/creditAnalyticsPage/creditAnalyticsPage";
import { ProtectedRoute } from "../shared/lib/ProtectedRoutes";
import { useAuth } from "../shared/lib//AuthProvider";

export const AppRoutes = () => {
  const { isAuthenticated, userRole, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/accounts" />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:accountId/transactions" element={<AccountTransactionsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/credits/analytics" element={<CreditAnalyticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<h1>Страница не найдена</h1>} />
    </Routes>
  );
};