import { Modal, Button, Form } from "react-bootstrap";
import { useTheme } from "../../shared/lib/provider/themeProvider"

type PayCreditModalProps = {
  show: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (value: string) => void;
  onSubmit: () => void;
  maxAmount?: number;
};

export const PayCreditModal = ({ show, onClose, amount, setAmount, onSubmit, maxAmount }: PayCreditModalProps) => {
  const numericAmount = Number(amount);
  const isInvalid = amount !== "" && (isNaN(numericAmount) || numericAmount <= 0 || (maxAmount !== undefined && numericAmount > maxAmount));
  const { theme } = useTheme();

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Modal.Title>Погашение кредита</Modal.Title>
      </Modal.Header>

      <Modal.Body className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Form>
          <Form.Group>
            <Form.Label>Сумма</Form.Label>
            <Form.Control
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Введите сумму"
              isInvalid={isInvalid}
              className={theme === "DARK" ? "bg-secondary text-light border-light dark-placeholder" : ""}
            />
            {maxAmount && (
              <Form.Text className={theme === "DARK" ? "text-light" : "text-muted"}>
                Максимально доступно: {maxAmount.toLocaleString()}
              </Form.Text>
            )}
            <Form.Control.Feedback type="invalid">
              Введите корректную сумму
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="success" disabled={amount === "" || isInvalid} onClick={onSubmit}>Оплатить</Button>
      </Modal.Footer>
    </Modal>
  );
};