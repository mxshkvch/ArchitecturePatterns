import { Modal, Button, Form } from "react-bootstrap";

type DepositModalProps = {
  show: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (value: string) => void;
  onSubmit: () => void;
};

export const DepositModal = ({show, onClose, amount, setAmount, onSubmit }: DepositModalProps) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Пополнение счета</Modal.Title>
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
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="success" onClick={onSubmit} disabled={!amount || Number(amount) <= 0}>Пополнить</Button>
      </Modal.Footer>
    </Modal>
  );
};