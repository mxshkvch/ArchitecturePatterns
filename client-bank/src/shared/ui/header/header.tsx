import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

import { useTheme } from "../../lib/provider/themeProvider";

export const Header = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <Navbar bg={theme === "DARK" ? "dark" : "light"} variant={theme === "DARK" ? "dark" : "light"} expand="lg">
      <Container>
        <Navbar.Brand>Bank App</Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link as={NavLink} to="/accounts">
            Мои счета
          </Nav.Link>

          <Nav.Link as={NavLink} to="/credits">
            Мои кредиты
          </Nav.Link>
        </Nav>

        <Button
          variant={theme === "DARK" ? "outline-light" : "outline-dark"}
          size="sm"
          onClick={toggleTheme}
          className="me-2"
        >
          {theme === "DARK" ? "☀️" : "🌙"}
        </Button>

        <Button variant="outline-danger" size="sm" onClick={handleLogout}>
          Выйти
        </Button>
      </Container>
    </Navbar>
  );
};