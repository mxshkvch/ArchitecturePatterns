import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Pagination, Spinner } from "react-bootstrap";
import { useTheme } from "../../shared/lib/provider/themeProvider";

import { fetchMyCreditRating, fetchDelinquencies, type CreditRating, type Delinquency } from "../../shared/lib/api/creditAnalytics";

export const CreditAnalyticsPage = () => {
  const { theme } = useTheme();

  const [rating, setRating] = useState<CreditRating | null>(null);
  const [loadingRating, setLoadingRating] = useState(true);

  const [delinquencies, setDelinquencies] = useState<Delinquency[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingDelinq, setLoadingDelinq] = useState(true);

  const pageSize = 6;
  

  useEffect(() => {
    const loadRating = async () => {
      try {
        const data = await fetchMyCreditRating();
        setRating(data);
      } catch (err) {
        console.error("Ошибка загрузки рейтинга", err);
      } finally {
        setLoadingRating(false);
      }
    };

    loadRating();
  }, []);

  useEffect(() => {
    const loadDelinq = async () => {
      setLoadingDelinq(true);
      try {
        const data = await fetchDelinquencies(currentPage + 1, pageSize);
        setDelinquencies(data.content);
        setTotalPages(data.page.totalPages);
      } catch (err) {
        console.error("Ошибка загрузки просрочек", err);
        setDelinquencies([]);
      } finally {
        setLoadingDelinq(false);
      }
    };

    loadDelinq();
  }, [currentPage]);

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Card
            className={`shadow-sm ${
              theme === "DARK" ? "bg-dark text-light" : "bg-white text-dark"
            }`}
          >
            <Card.Body>
              <Card.Title>Кредитный рейтинг</Card.Title>

              {loadingRating ? (
                <Spinner />
              ) : rating ? (
                <>
                  <h4>
                    {(rating.repaymentProbability * 100).toFixed(0)}%
                  </h4>
                  <p>Вероятность возврата кредита</p>

                  <Row>
                    <Col>Активные: {rating.activeCredits}</Col>
                    <Col>Закрытые: {rating.paidCredits}</Col>
                  </Row>
                  <Row>
                    <Col>Просрочки: {rating.overdueCredits}</Col>
                    <Col>Дефолты: {rating.defaultedCredits}</Col>
                  </Row>

                  <small>
                    Обновлено:{" "}
                    {new Date(rating.calculatedAt).toLocaleString()}
                  </small>
                </>
              ) : (
                <p>Не удалось загрузить рейтинг</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card
            className={`shadow-sm ${
              theme === "DARK" ? "bg-dark text-light" : "bg-white text-dark"
            }`}
          >
            <Card.Body>
              <Card.Title>Просроченные платежи</Card.Title>

              {loadingDelinq ? (
                <Spinner />
              ) : delinquencies.length === 0 ? (
                <p>Нет просроченных платежей</p>
              ) : (
                <>
                  <Table
                    striped
                    bordered
                    hover
                    className={theme === "DARK" ? "table-dark" : ""}
                  >
                    <thead>
                      <tr>
                        <th>Кредит</th>
                        <th>Сумма</th>
                        <th>Дата платежа</th>
                        <th>Просрочка (дней)</th>
                        <th>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delinquencies.map((d) => (
                        <tr key={d.creditId}>
                          <td>{d.creditId}</td>
                          <td>{d.remainingAmount.toLocaleString()}</td>
                          <td>
                            {new Date(d.dueDate).toLocaleDateString()}
                          </td>
                          <td>{d.daysOverdue}</td>
                          <td>{d.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Pagination className="justify-content-center">
                    <Pagination.Prev
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages - 1}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};