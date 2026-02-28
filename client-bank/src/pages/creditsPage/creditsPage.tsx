import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Pagination, Button } from "react-bootstrap";
import { PayCreditModal } from "../../features/credits/payCreditModal"

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

export const CreditsPage = () => {
  const [creditsResponse, setCreditsResponse] = useState<CreditsResponse>({
    content: [],
    page: {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },
  });

  const [currentPage, setCurrentPage] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fakeResponse: CreditsResponse = {
      content: Array.from({ length: 5 }, (_, i) => ({
        id: `credit-${i + 1}`,
        userId: `user-${i + 1}`,
        accountId: `account-${i + 1}`,
        tariffId: `tariff-${i + 1}`,
        principal: 1000 * (i + 1),
        remainingAmount: 500 * (i + 1),
        interestRate: 10 + i,
        startDate: `2026-02-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        endDate: `2027-02-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        status: i % 2 === 0 ? "ACTIVE" : "CLOSED",
      })),
      page: {
        page: 0,
        size: 20,
        totalElements: 5,
        totalPages: 1,
      },
    };

    setCreditsResponse(fakeResponse);
  }, []);

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

  const handlePay = () => {
    if (!selectedCredit) return;

    console.log("Погашение кредита:");
    console.log("CreditId:", selectedCredit.id);
    console.log("Amount:", amount);

    handleCloseModal();
  };

  const credits = creditsResponse.content;

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2>Мои кредиты</h2>
        </Col>
      </Row>

      <Row>
        {credits.map((credit) => (
            <Col md={6} key={credit.id} className="mb-4 d-flex">
            <Card className="shadow-sm flex-fill d-flex flex-column">
                <Card.Body className="d-flex flex-column h-100">
                <div className="flex-grow-1">
                    <Card.Title>Кредит №{credit.id}</Card.Title>

                    <Badge
                    bg={credit.status === "ACTIVE" ? "success" : "secondary"}
                    className="mb-2"
                    >
                    {credit.status}
                    </Badge>

                    <Card.Subtitle className="mb-2 text-muted">
                    Сумма: {credit.principal.toLocaleString()} | Остаток:{" "}
                    {credit.remainingAmount.toLocaleString()}
                    </Card.Subtitle>

                    <p>
                    Процентная ставка: {credit.interestRate}%<br />
                    Период:{" "}
                    {new Date(credit.startDate).toLocaleDateString()} -{" "}
                    {new Date(credit.endDate).toLocaleDateString()}
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

      <PayCreditModal
        show={showModal}
        onClose={handleCloseModal}
        amount={amount}
        setAmount={setAmount}
        onSubmit={handlePay}
        maxAmount={selectedCredit?.remainingAmount}
      />    

      <Row className="mt-4">
        <Col className="d-flex justify-content-center">
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            {Array.from({ length: creditsResponse.page.totalPages }, (_, i) => (
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setCurrentPage(i)}
              >
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