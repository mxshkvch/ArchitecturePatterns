import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Pagination, Button } from "react-bootstrap";
import { ApplyCreditModal } from "../../features/credits/applyCreditModal";
import type { CreditsResponse, Tariff } from "../../shared/lib/api/credits";;
import { fetchMyCredits, fetchTariffs, applyCredit } from "../../shared/lib/api/credits";

import { fetchAllAccounts } from "../../shared/lib/api/accounts";
import type { Account  } from "../../shared/lib/api/accounts";
import { useTheme } from "../../shared/lib/provider/themeProvider";
import { useNavigate } from "react-router-dom";

export const CreditsPage = () => {
  const [creditsResponse, setCreditsResponse] = useState<CreditsResponse>({
    content: [],
    page: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
  });
  const [currentPage, setCurrentPage] = useState(0);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tariffsLoading, setTariffsLoading] = useState(false);
  const [tariffsError, setTariffsError] = useState<string | null>(null);

  const [allAccounts, setAllAccounts] = useState<Account[]>([]);

  const { theme } = useTheme();
  const pageSize = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const data = await fetchMyCredits(currentPage + 1, pageSize);
        setCreditsResponse(data);
      } catch (err) {
        console.error("Не удалось загрузить кредиты", err);
        setCreditsResponse({
          content: [],
          page: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
        });
      }
    };

    loadCredits();

    const interval = setInterval(loadCredits, 60_000);
    return () => clearInterval(interval);
  }, [currentPage]);

  useEffect(() => {
    const loadAllAccounts = async () => {
      try {
        const accounts = await fetchAllAccounts();
        setAllAccounts(accounts);
      } catch (err) {
        console.error("Не удалось загрузить счета", err);
      }
    };

    loadAllAccounts();
  }, []);

  useEffect(() => {
    if (!showApplyModal) return;
    setTariffsLoading(true);
    setTariffsError(null);

    fetchTariffs()
      .then(setTariffs)
      .catch(() => setTariffsError("Не удалось загрузить тарифы"))
      .finally(() => setTariffsLoading(false));
  }, [showApplyModal]);

  const handleApplyCredit = async (
    tariffId: string,
    accountId: string,
    amount: number,
    term: number
  ) => {
    try {
      await applyCredit(tariffId, accountId, amount, term);
      setShowApplyModal(false);
      const data = await fetchMyCredits(currentPage + 1, 10);
      setCreditsResponse(data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        alert("На мастер счете недостаточно денег для выдачи кредита");
      } else {
        alert("Ошибка при оформлении кредита");
      }
    }
  };

  return (
    <Container className="py-5">
      <ApplyCreditModal
        show={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleApplyCredit}
        tariffs={tariffs}
        accounts={allAccounts}
        loading={tariffsLoading}
        error={tariffsError}
      />

      <Row className="mb-4">
        <Col>
          <h2>Мои кредиты</h2>
        </Col>
        <Col className="text-end">
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant={theme === "DARK" ? "outline-light" : "info"}
              onClick={() => navigate("/credits/analytics")}
            >
              Рейтинг и просрочки
            </Button>

            <Button
              variant={theme === "DARK" ? "outline-light" : "success"}
              onClick={() => setShowApplyModal(true)}
            >
              Взять кредит
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        {creditsResponse.content.map((credit) => (
          <Col md={6} key={credit.id} className="mb-4 d-flex">
            <Card
              className={`shadow-sm flex-fill d-flex flex-column ${
                theme === "DARK" ? "bg-dark text-light" : "bg-white text-dark"
              }`}
            >
              <Card.Body className="d-flex flex-column h-100">
                <div className="flex-grow-1">
                  <Card.Title>Кредит №{credit.id}</Card.Title>
                  <Badge
                    bg={credit.status === "ACTIVE" ? "success" : "secondary"}
                    className={`mb-2 ${theme === "DARK" ? "text-light" : ""}`}
                  >
                    {credit.status}
                  </Badge>
                  <Card.Subtitle className={`mb-2 ${theme === "DARK" ? "text-light" : "text-muted"}`}>
                    Сумма: {credit.principal.toLocaleString()} | Остаток: {credit.remainingAmount.toLocaleString()}
                  </Card.Subtitle>
                  <p>
                    Процентная ставка: {credit.interestRate}%<br />
                    Период: {new Date(credit.startDate).toLocaleDateString()} -{" "}
                    {new Date(credit.endDate).toLocaleDateString()}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col className="d-flex justify-content-center">
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={theme === "DARK" ? "bg-dark text-light" : ""}
            />
            {Array.from({ length: creditsResponse.page.totalPages }, (_, i) => (
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setCurrentPage(i)}
                className={theme === "DARK" ? "bg-dark text-light border-light" : ""}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={currentPage === creditsResponse.page.totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={theme === "DARK" ? "bg-dark text-light" : ""}
            />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};