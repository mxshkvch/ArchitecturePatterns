import { Card, Row, Col } from "react-bootstrap";
import type { CreditRating } from "../shared/lib/api/creditAnalytics";
import { SpinnerComponent } from "../shared/ui/components/spinner";

type Props = {
  rating: CreditRating | null;
  loading: boolean;
  theme: "LIGHT" | "DARK";
};

export const CreditRatingCard = ({ rating, loading, theme }: Props) => {
  return (
    <Card className={theme === "DARK" ? "bg-dark text-light" : ""}>
      <Card.Body>
        <Card.Title>Кредитный рейтинг</Card.Title>

        {loading ? (
          <SpinnerComponent theme={theme} />
        ) : rating ? (
          <>
            <h4>{(rating.repaymentProbability * 100).toFixed(0)}%</h4>
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
              {new Date(rating.calculatedAt).toLocaleString()}
            </small>
          </>
        ) : (
          <p>Ошибка загрузки</p>
        )}
      </Card.Body>
    </Card>
  );
};