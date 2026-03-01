import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { login } from "../../shared/lib/api/login";
import type { LoginRequest } from "../../shared/lib/api/login";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(form);
      localStorage.setItem("accessToken", data.token);
      navigate("/accounts");
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.detail || "Ошибка авторизации");
      } else {
        setError("Сервер недоступен или CORS ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5} className="mx-auto">
          <Card className="shadow">
            <Card.Body>
              <h3 className="text-center mb-4">Вход</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? <><Spinner size="sm" animation="border" className="me-2" />Вход...</> : "Войти"}
                </Button>
                <Button variant="secondary" className="w-100 mt-2" onClick={() => navigate("/register")}>
                  Нет аккаунта? Зарегистрироваться
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};