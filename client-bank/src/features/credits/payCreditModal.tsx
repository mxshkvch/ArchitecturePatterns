import { Modal, Button, Form } from "react-bootstrap";

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
  const isInvalid =
    amount !== "" && (isNaN(numericAmount) || numericAmount <= 0 || (maxAmount !== undefined && numericAmount > maxAmount));

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Погашение кредита</Modal.Title>
      </Modal.Header>

      <Modal.Body>
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
            />
            {maxAmount && (
              <Form.Text className="text-muted">
                Максимально доступно: {maxAmount.toLocaleString()}
              </Form.Text>
            )}
            <Form.Control.Feedback type="invalid">
              Введите корректную сумму
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="success" disabled={amount === "" || isInvalid} onClick={onSubmit}>Оплатить</Button>
      </Modal.Footer>
    </Modal>
  );
};