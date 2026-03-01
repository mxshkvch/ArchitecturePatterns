import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Pagination, Button } from "react-bootstrap";
import { PayCreditModal } from "../../features/credits/payCreditModal";
import { ApplyCreditModal } from "../../features/credits/applyCreditModal";

type Credit = {
  id: string;
  userId: string;
  accountId: string;
  tariffId: string;
  principal: number;
  remainingAmount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "CLOSED";
};

type CreditsResponse = {
  content: Credit[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type TariffStatus = "ACTIVE" | "PAID" | "OVERDUE" | "DEFAULTED";

export type Tariff = {
  id: string;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  status: TariffStatus;
};

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

  useEffect(() => {
    if (!showApplyModal) return;

    setTariffsLoading(true);
    setTariffsError(null);

    axios
      axios
      .get("http://localhost:5107/credits/tariffs", { params: { page: 1, size: 10 } }) 
      .then((res) => setTariffs(res.data.content))
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
    const token = localStorage.getItem("accessToken");
    await axios.post(
      `http://localhost:5107/credits/${selectedCredit.id}/pay`,
      { amount: numAmount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Платёж успешно проведён!");
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

  const handleApplyCredit = (tariffId: string, amount: number, term: number) => {
    console.log("Оформлен кредит с тарифом", tariffId, "сумма", amount, "срок", term);
  };

  useEffect(() => {
  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:5107/credits/my", {
        params: { page: currentPage + 1, size: 10 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCreditsResponse({
        content: res.data.content,
        page: res.data.page,
      });
    } catch (error) {
      console.error("Не удалось загрузить кредиты", error);
      setCreditsResponse({
        content: [],
        page: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
      });
    }
  };

  fetchCredits();
}, [currentPage]);

  const credits = creditsResponse.content;

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
        {credits.map((credit) => (
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