import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from "react-bootstrap";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  //потом написать нормальные запросы
  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (form.email === "test@mail.com") {
        setError("Пользователь уже существует");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", "mock-token");

      navigate("/");
    }, 1000);
  };

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
        <Row className="w-100">
            <Col xs={12} sm={10} md={8} lg={6} xl={5} className="mx-auto">
            <Card className="shadow">
                <Card.Body>
                <h3 className="text-center mb-4">Регистрация</h3>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Имя</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Фамилия</Form.Label>
                    <Form.Control
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                    />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <Form.Label>Телефон</Form.Label>
                    <Form.Control
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />
                    </Form.Group>

                    <Form.Group className="mb-4">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    </Form.Group>

                    <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                    >
                    {loading ? (<><Spinner size="sm" animation="border" className="me-2" />Регистрация...</>) : ("Зарегистрироваться")}
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-100 mt-2"
                        onClick={() => navigate("/login")}
                    >
                    Уже есть аккаунт? Войти
                    </Button>

                </Form>
                </Card.Body>
            </Card>
            </Col>
        </Row>
    </Container>
  );
};