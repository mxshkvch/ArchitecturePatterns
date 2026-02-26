import { Outlet } from "react-router-dom";
import { Header } from "../header/header";
import { Footer } from "../footer/footer";

export const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="flex-grow-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};