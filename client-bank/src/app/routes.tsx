import { Routes, Route, Navigate } from "react-router-dom";
import { RegisterPage } from "../pages/registerPage/registerPage";
import { LoginPage } from "../pages/authPage/loginPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<h1>Страница не найдена</h1>} />
    </Routes>
  );
};