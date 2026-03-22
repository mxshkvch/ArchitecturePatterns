import { Card, Badge } from "react-bootstrap";
import type { Credit } from "../shared/lib/api/credits"

type Props = {
  credit: Credit;
  theme: "LIGHT" | "DARK";
};

export const CreditCard = ({ credit, theme }: Props) => (
  <Card className={`shadow-sm flex-fill d-flex flex-column ${theme === "DARK" ? "bg-dark text-light" : "bg-white text-dark"}`}>
    <Card.Body className="d-flex flex-column h-100">
      <div className="flex-grow-1">
        <Card.Title>Кредит №{credit.id}</Card.Title>
        <Badge bg={credit.status === "ACTIVE" ? "success" : "secondary"} className={`mb-2 ${theme === "DARK" ? "text-light" : ""}`}>
          {credit.status}
        </Badge>
        <Card.Subtitle className={`mb-2 ${theme === "DARK" ? "text-light" : "text-muted"}`}>
          Сумма: {credit.principal.toLocaleString()} | Остаток: {credit.remainingAmount.toLocaleString()}
        </Card.Subtitle>
        <p>
          Процентная ставка: {credit.interestRate}%<br />
          Период: {new Date(credit.startDate).toLocaleDateString()} - {new Date(credit.endDate).toLocaleDateString()}
        </p>
      </div>
    </Card.Body>
  </Card>
);