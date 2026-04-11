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

  console.log('\n🔐 ===== APP ROUTES STATE =====');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - isLoading:', isLoading);
  console.log('  - userRole:', userRole);
  console.log('  - token:', token ? `${token.substring(0, 50)}...` : 'missing');
  console.log('🔐 ===========================\n');

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
      {/* Публичные маршруты */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Защищенные маршруты - требуют аутентификации */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/accounts" />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:accountId/transactions" element={<AccountTransactionsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/credits/analytics" element={<CreditAnalyticsPage />} />
        </Route>
      </Route>

      {/* 404 - страница не найдена */}
      <Route path="*" element={<h1>Страница не найдена</h1>} />
    </Routes>
  );
};