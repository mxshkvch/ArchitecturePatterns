import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useTheme } from "../../shared/lib/provider/themeProvider";

import { fetchCreditRating, fetchDelinquenciesUseCase } from "../../features/accounts/useCases/fetchRatingDelinquencies";

import { SpinnerComponent } from "../../shared/ui/components/spinner";
import { PaginationComponent } from "../../shared/ui/components/pagination";

import { CreditRatingCard } from "../../entities/creditRatingCard";
import { DelinquencyTable } from "../../entities/delinquencyTable";

import type { CreditRating, Delinquency } from "../../shared/lib/api/creditAnalytics";

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
    fetchCreditRating()
      .then(setRating)
      .finally(() => setLoadingRating(false));
  }, []);

  useEffect(() => {
    setLoadingDelinq(true);

    fetchDelinquenciesUseCase(currentPage + 1, pageSize)
      .then(({ delinquencies, totalPages }) => {
        setDelinquencies(delinquencies);
        setTotalPages(totalPages);
      })
      .finally(() => setLoadingDelinq(false));
  }, [currentPage]);

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <CreditRatingCard rating={rating} loading={loadingRating} theme={theme}/>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className={theme === "DARK" ? "bg-dark text-light" : ""}>
            <Card.Body>
              <Card.Title>Просроченные платежи</Card.Title>

              {loadingDelinq ? (
                <SpinnerComponent theme={theme} />
              ) : delinquencies.length === 0 ? (
                <p>Нет данных</p>
              ) : (
                <>
                  <DelinquencyTable data={delinquencies} theme={theme}/>

                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    theme={theme}
                  />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};