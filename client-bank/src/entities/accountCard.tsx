import { Card, Button, Badge } from "react-bootstrap";
import type { Account } from "../shared/lib/api/accounts";
import { useTheme } from "../shared/lib/provider/themeProvider";

type AccountCardProps = {
  account: Account & { isHidden: boolean };
  onDeposit: (id: string) => void;
  onWithdraw: (id: string) => void;
  onTransfer: (id: string) => void;
  onClose: (id: string) => void;
  onToggleHide: (id: string) => void;
  onHistory: (id: string) => void;
};

export const AccountCard = ({ account, onDeposit, onWithdraw, onTransfer, onClose, onToggleHide, onHistory }: AccountCardProps) => {
  const { theme } = useTheme();

  if (account.isHidden) {
    return (
      <Card className={`shadow-sm ${theme === "DARK" ? "bg-dark text-light" : "bg-white text-dark"}`}>
        <Card.Body style={{ minHeight: "220px" }}>
          <Card.Title>Счет скрыт</Card.Title>
          <Button
            size="sm"
            variant={theme === "DARK" ? "outline-light" : "outline-primary"}
            onClick={() => onToggleHide(account.id)}
          >
            Показать
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`shadow-sm ${theme === "DARK" ? "bg-dark text-light" : "bg-white text-dark"}`}>
      <Card.Body style={{ minHeight: "220px" }}>
        <Card.Title>№ {account.accountNumber}</Card.Title>
        <Card.Subtitle className={`mb-2 ${theme === "DARK" ? "text-light" : "text-muted"}`}>
          Открыт: {new Date(account.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </Card.Subtitle>
        <h4 className="my-3">{account.balance.toLocaleString()} {account.currency}</h4>
        <Badge bg={account.status === "ACTIVE" ? "success" : "secondary"} className="mb-3">
          {account.status}
        </Badge>
        <div className="d-flex gap-2 flex-wrap">
          <Button size="sm" variant={theme === "DARK" ? "outline-light" : "primary"} onClick={() => onDeposit(account.id)} disabled={account.status === "CLOSED"}>Внести</Button>
          <Button size="sm" variant={theme === "DARK" ? "outline-warning" : "warning"} onClick={() => onWithdraw(account.id)} disabled={account.status === "CLOSED"}>Снять</Button>
          <Button size="sm" variant={theme === "DARK" ? "outline-info" : "info"} onClick={() => onHistory(account.id)}>История</Button>
          <Button size="sm" variant={theme === "DARK" ? "outline-danger" : "danger"} onClick={() => onClose(account.id)} disabled={account.status === "CLOSED"}>Закрыть</Button>
          <Button size="sm" variant={theme === "DARK" ? "outline-secondary" : "secondary"} onClick={() => onTransfer(account.id)} disabled={account.status === "CLOSED"}>Перевести</Button>
          <Button size="sm" variant={theme === "DARK" ? "outline-light" : "outline-secondary"} onClick={() => onToggleHide(account.id)}>Скрыть</Button>
        </div>
      </Card.Body>
    </Card>
  );
};