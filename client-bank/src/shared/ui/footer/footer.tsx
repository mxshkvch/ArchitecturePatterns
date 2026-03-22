import { Container } from "react-bootstrap";
import { useTheme } from "../../lib/provider/themeProvider";

export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`text-center py-3 mt-auto ${
        theme === "DARK" ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <Container>
        <small>© 2026 Bank App</small>
      </Container>
    </footer>
  );
};