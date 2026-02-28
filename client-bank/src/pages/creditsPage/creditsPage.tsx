import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Pagination } from "react-bootstrap";

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
          <Col md={6} key={credit.id} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Кредит №{credit.id}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Сумма: {credit.principal.toLocaleString()} | Остаток: {credit.remainingAmount.toLocaleString()}
                </Card.Subtitle>
                <p>
                  Процентная ставка: {credit.interestRate}%<br/>
                  Период: {new Date(credit.startDate).toLocaleDateString()} - {new Date(credit.endDate).toLocaleDateString()}
                </p>
                <Badge bg={credit.status === "ACTIVE" ? "success" : "secondary"}>
                  {credit.status}
                </Badge>
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