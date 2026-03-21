import type { FC } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTheme } from "../../shared/lib/provider/themeProvider"

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

  const { theme } = useTheme();

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header 
        closeButton 
        className={theme === "DARK" ? "bg-dark border-light" : ""}
      >
        <Modal.Title className={theme === "DARK" ? "text-light" : ""}>
          Открыть новый счет
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className={theme === "DARK" ? "text-light" : ""}>Валюта</Form.Label>
            <Form.Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "RUB" | "USD" | "EUR")}
              className={theme === "DARK" ? "bg-secondary text-light border-light" : ""}
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={theme === "DARK" ? "text-light" : ""}>Начальный депозит</Form.Label>
            <Form.Control
              type="text"
              value={initialDeposit}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setInitialDeposit(val);
              }}
              placeholder="Введите сумму"
              className={theme === "DARK" ? "bg-secondary text-light border-light dark-placeholder" : ""}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className={theme === "DARK" ? "bg-dark border-light" : ""}>
        <Button variant={theme === "DARK" ? "outline-light" : "secondary"} onClick={onClose}>
          Отмена
        </Button>
        <Button variant="success" onClick={handleCreate}>Создать</Button>
      </Modal.Footer>
    </Modal>
  );
};