import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Pagination, Button } from "react-bootstrap";
import { PayCreditModal } from "../../features/credits/payCreditModal";
import { ApplyCreditModal } from "../../features/credits/applyCreditModal";
import type { Credit, CreditsResponse, Tariff } from "../../shared/lib/api/credits";;
import { fetchMyCredits, payCredit, fetchTariffs, applyCredit } from "../../shared/lib/api/credits";

import { fetchAllAccounts } from "../../shared/lib/api/accounts";
import type { Account  } from "../../shared/lib/api/accounts";

export const CreditsPage = () => {
  const [creditsResponse, setCreditsResponse] = useState<CreditsResponse>({
    content: [],
    page: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
  });
  const [currentPage, setCurrentPage] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [amount, setAmount] = useState("");

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tariffsLoading, setTariffsLoading] = useState(false);
  const [tariffsError, setTariffsError] = useState<string | null>(null);

  const [allAccounts, setAllAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const data = await fetchMyCredits(currentPage + 1, 10);
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

  const handleOpenModal = (credit: Credit) => {
    setSelectedCredit(credit);
    setAmount("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCredit(null);
    setAmount("");
  };

  const handlePay = async () => {
    if (!selectedCredit) return;
    const numAmount = Number(amount);
    if (numAmount <= 0) {
      alert("Введите сумму погашения больше 0");
      return;
    }
    try {
      await payCredit(selectedCredit.id, numAmount);
      handleCloseModal();
      setCreditsResponse((prev) => ({
        ...prev,
        content: prev.content.map((c) =>
          c.id === selectedCredit.id
            ? { ...c, remainingAmount: c.remainingAmount - numAmount }
            : c
        ),
      }));
    } catch (err) {
      console.error(err);
      alert("Ошибка при проведении платежа");
    }
  };

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
      <PayCreditModal
        show={showModal}
        onClose={handleCloseModal}
        amount={amount}
        setAmount={setAmount}
        onSubmit={handlePay}
        maxAmount={selectedCredit?.remainingAmount}
      />

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
          <Button variant="success" onClick={() => setShowApplyModal(true)}>Взять кредит</Button>
        </Col>
      </Row>

      <Row>
        {creditsResponse.content.map((credit) => (
          <Col md={6} key={credit.id} className="mb-4 d-flex">
            <Card className="shadow-sm flex-fill d-flex flex-column">
              <Card.Body className="d-flex flex-column h-100">
                <div className="flex-grow-1">
                  <Card.Title>Кредит №{credit.id}</Card.Title>
                  <Badge bg={credit.status === "ACTIVE" ? "success" : "secondary"} className="mb-2">
                    {credit.status}
                  </Badge>
                  <Card.Subtitle className="mb-2 text-muted">
                    Сумма: {credit.principal.toLocaleString()} | Остаток: {credit.remainingAmount.toLocaleString()}
                  </Card.Subtitle>
                  <p>
                    Процентная ставка: {credit.interestRate}%<br />
                    Период: {new Date(credit.startDate).toLocaleDateString()} - {new Date(credit.endDate).toLocaleDateString()}
                  </p>
                </div>
                {credit.status === "ACTIVE" && (
                  <div className="d-grid">
                    <Button variant="primary" onClick={() => handleOpenModal(credit)}>Погасить</Button>
                  </div>
                )}
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
            />
            {Array.from({ length: creditsResponse.page.totalPages }, (_, i) => (
              <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={currentPage === creditsResponse.page.totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};