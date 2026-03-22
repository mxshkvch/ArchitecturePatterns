import { useState } from "react";
import { useTheme } from "../../shared/lib/provider/themeProvider";
import { Modal, Button, Form } from "react-bootstrap";
import { SpinnerComponent } from "../../shared/ui/components/spinner";

type DepositModalProps = {
  show: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (value: string) => void;
  onSubmit: () => void; 
};

export const DepositModal = ({ show, onClose, amount, setAmount, onSubmit }: DepositModalProps) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      await Promise.resolve(onSubmit());
      onClose();
    } catch (e) {
      console.error(e);
      alert("Ошибка при пополнении счета");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Modal.Title>Пополнение счета</Modal.Title>
      </Modal.Header>

      <Modal.Body className={theme === "DARK" ? "bg-dark text-light" : ""}>
        {isLoading ? (
          <SpinnerComponent theme={theme} />
        ) : (
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
                className={theme === "DARK" ? "bg-secondary text-light border-light dark-placeholder" : ""}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Button variant={theme === "DARK" ? "secondary" : "secondary"} onClick={onClose} disabled={isLoading}>
          Отмена
        </Button>
        <Button
          variant={theme === "DARK" ? "success" : "success"}
          onClick={handleSubmit}
          disabled={!amount || Number(amount) <= 0 || isLoading}
        >
          {isLoading ? "Пополнение..." : "Пополнить"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};