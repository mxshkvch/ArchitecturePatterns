import { Modal, Button, Form } from "react-bootstrap";

type WithdrawModalProps = {
  show: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (value: string) => void;
  onSubmit: () => void;
};

export const WithdrawModal = ({ show, onClose, amount, setAmount, onSubmit }: WithdrawModalProps) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Снять деньги со счета</Modal.Title>
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
        <Button variant="warning" onClick={onSubmit} disabled={!amount || Number(amount) <= 0}>Снять</Button>
      </Modal.Footer>
    </Modal>
  );
};