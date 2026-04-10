import { register } from "../../shared/api/reg";
import type { RegisterRequest } from "../../shared/api/reg";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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
    confirmPassword: "",
  });

  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "ADMIN">("CLIENT");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    console.log('🔍 Form submitted with data:', { ...form, password: '***' });
    
    
    
    setLoading(true);

    const payload: RegisterRequest = { 
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      role: selectedRole 
    };

    console.log('📤 Sending registration request:', { ...payload, password: '***' });

    try {
      const data = await register(payload);
      console.log('✅ Registration successful:', data);
      
      console.log('Response data structure:', {
        hasUserId: !!data.userId,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken
      });
      
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userRole", selectedRole.toLowerCase());
        localStorage.setItem("userEmail", form.email);
        console.log('💾 Token saved to localStorage');
      } else {
        console.warn('⚠️ No accessToken in response');
      }
      
      setSuccess("Регистрация успешна! Перенаправление...");
      
      setTimeout(() => {
          console.log('🔄 Redirecting to client app: http://localhost:5174');
          window.location.href = "http://localhost:5174?token=" + encodeURIComponent(data.accessToken) + "&role=client";
        
      }, 2000);
    } catch (err: any) {

      
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || "Некорректные данные. Проверьте правильность заполнения полей.";
        setError(errorMessage);
      } else if (err.response?.status === 409) {
        setError("Пользователь с таким email уже существует");
      } else if (err.response?.status === 500) {
        setError("Серверная ошибка. Попробуйте позже.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Ошибка сети. Проверьте подключение к серверу.");
      } else {
        setError(err.response?.data?.message || "Ошибка регистрации");
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
            <Card.Body className="p-4">
              <h3 className="text-center mb-2">Регистрация</h3>
              <p className="text-center text-muted mb-4">Создайте новый аккаунт</p>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="example@email.com"
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
                    placeholder="Введите имя"
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
                    placeholder="Введите фамилию"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Телефон</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange}
                    placeholder="+7 (999) 123-45-67"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
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
                  {loading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Регистрация...
                    </>
                  ) : (
                    "Зарегистрироваться"
                  )}
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