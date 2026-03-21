import type { FC } from "react";
import { Modal, Button, Form } from "react-bootstrap";

type Props = {
  show: boolean;
  onClose: () => void;
  currency: "RUB" | "USD" | "EUR";
  setCurrency: (value: "RUB" | "USD" | "EUR") => void;
  initialDeposit: string;
  setInitialDeposit: (value: string) => void;
  onCreate: (amount: number) => void;
};

export const CreateAccountModal: FC<Props> = ({show, onClose, currency, setCurrency, initialDeposit, setInitialDeposit, onCreate}) => {
  const handleCreate = () => {
    const amount = Number(initialDeposit);
    if (isNaN(amount) || amount <= 0) {
      alert("Введите корректный депозит");
      return;
    }
    onCreate(amount);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Открыть новый счет</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Валюта</Form.Label>
            <Form.Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "RUB" | "USD" | "EUR")}
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Начальный депозит</Form.Label>
            <Form.Control
              type="text"
              value={initialDeposit}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setInitialDeposit(val);
              }}
              placeholder="Введите сумму"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="success" onClick={handleCreate}>Создать</Button>
      </Modal.Footer>
    </Modal>
  );
};