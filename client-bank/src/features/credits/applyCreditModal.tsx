import { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import type { Tariff } from "../../shared/lib/api/credits";
import type { Account } from "../../shared/lib/api/accounts";
import { useTheme } from "../../shared/lib/provider/themeProvider"

type ApplyCreditModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (tariffId: string, accountId: string, amount: number, term: number) => void;
  tariffs: Tariff[];
  accounts: Account[];
  loading: boolean;
  error: string | null;
};

export const ApplyCreditModal = ({show, onClose, onSubmit, tariffs, accounts, loading, error, }: ApplyCreditModalProps) => {
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [term, setTerm] = useState<number | string>("");
  const { theme } = useTheme();

  useEffect(() => {
    if (!show) {
      setSelectedTariff(null);
      setSelectedAccountId("");
      setAmount("");
      setTerm("");
    }
  }, [show]);

  const handleSubmit = () => {
    if (!selectedTariff) {
      alert("Выберите тариф");
      return;
    }
    if (!selectedAccountId) {
      alert("Выберите счет для зачисления кредита");
      return;
    }

    const numAmount = Number(amount);
    const numTerm = Number(term);

    if (
      numAmount < selectedTariff.minAmount ||
      numAmount > selectedTariff.maxAmount ||
      numTerm < selectedTariff.minTerm ||
      numTerm > selectedTariff.maxTerm
    ) {
      alert("Сумма или срок не соответствуют выбранному тарифу");
      return;
    }

    onSubmit(selectedTariff.id, selectedAccountId, numAmount, numTerm);
    onClose();
  };

  const isAmountInvalid =
    selectedTariff && amount !== "" &&
    (Number(amount) < selectedTariff.minAmount || Number(amount) > selectedTariff.maxAmount);

  const isTermInvalid =
    selectedTariff && term !== "" &&
    (Number(term) < selectedTariff.minTerm || Number(term) > selectedTariff.maxTerm);

  const isValid =
    selectedTariff &&
    selectedAccountId &&
    amount !== "" &&
    term !== "" &&
    !isAmountInvalid &&
    !isTermInvalid;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Modal.Title>Оформить кредит</Modal.Title>
      </Modal.Header>

      <Modal.Body className={theme === "DARK" ? "bg-dark text-light" : ""}>
        {loading && <p>Загрузка тарифов...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && tariffs.length === 0 && <p>Нет доступных тарифов</p>}

        {!loading && !error && tariffs.length > 0 && (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Выберите тариф</Form.Label>
              <ListGroup className={theme === "DARK" ? "bg-secondary text-light" : ""}>
                {tariffs.map((tariff) => (
                  <OverlayTrigger
                    key={tariff.id}
                    placement="right"
                    overlay={
                      <Tooltip id={`tooltip-${tariff.id}`}>
                        Мин. сумма: {tariff.minAmount} | Макс. сумма: {tariff.maxAmount}
                        <br />
                        Мин. срок: {tariff.minTerm} мес. | Макс. срок: {tariff.maxTerm} мес.
                        <br />
                        Ставка: {tariff.interestRate}%
                      </Tooltip>
                    }
                  >
                    <ListGroup.Item
                      action
                      active={selectedTariff?.id === tariff.id}
                      onClick={(e) => { e.preventDefault(); setSelectedTariff(tariff); }}
                      className={theme === "DARK" ? "bg-dark text-light" : ""}
                    >
                      {tariff.name} (Ставка: {tariff.interestRate}%)
                    </ListGroup.Item>
                  </OverlayTrigger>
                ))}
              </ListGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Счет для зачисления</Form.Label>
              <Form.Select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className={theme === "DARK" ? "bg-secondary text-light border-light" : ""}
              >
                <option value="">Выберите счет</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    №{a.accountNumber} — Баланс: {a.balance.toLocaleString()} {a.currency}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Label>Сумма</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Введите сумму"
              min={selectedTariff?.minAmount}
              max={selectedTariff?.maxAmount}
              step={0.01}
              isInvalid={!!isAmountInvalid}
              className={theme === "DARK" ? "bg-secondary text-light border-light dark-placeholder" : ""}
            />

            <Form.Label className="mt-3">Срок (мес.)</Form.Label>
            <Form.Control
              type="number"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Введите срок"
              min={selectedTariff?.minTerm}
              max={selectedTariff?.maxTerm}
              isInvalid={!!isTermInvalid}
              className={theme === "DARK" ? "bg-secondary text-light border-light dark-placeholder" : ""}
            />
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className={theme === "DARK" ? "bg-dark text-light" : ""}>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="primary" disabled={!isValid} onClick={handleSubmit}>Оформить</Button>
      </Modal.Footer>
    </Modal>
  );
}