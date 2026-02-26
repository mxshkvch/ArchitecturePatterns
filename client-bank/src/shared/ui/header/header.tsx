import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
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

        <Button variant="outline-light" size="sm" onClick={handleLogout}>
          Выйти
        </Button>
      </Container>
    </Navbar>
  );
};