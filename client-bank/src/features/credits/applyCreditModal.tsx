import { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap";

type Tariff = {
  id: string;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  status: "ACTIVE";
};

type ApplyCreditModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (tariffId: string, amount: number, term: number) => void;
};

export const ApplyCreditModal = ({ show, onClose, onSubmit }: ApplyCreditModalProps) => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [amount, setAmount] = useState<number | string>("");
  const [term, setTerm] = useState<number | string>("");

  useEffect(() => {
    const fakeTariffs: Tariff[] = [
      { id: "tariff-1", name: "Стандартный", interestRate: 10, minAmount: 1000, maxAmount: 5000, minTerm: 1, maxTerm: 12, status: "ACTIVE" },
      { id: "tariff-2", name: "Премиум", interestRate: 8, minAmount: 5000, maxAmount: 20000, minTerm: 1, maxTerm: 24, status: "ACTIVE" },
    ];
    setTariffs(fakeTariffs);
  }, []);

  const handleSubmit = () => {
    if (!selectedTariff) return;

    const numAmount = Number(amount);
    const numTerm = Number(term);

    if (
      numAmount < selectedTariff.minAmount ||
      numAmount > selectedTariff.maxAmount ||
      numTerm < selectedTariff.minTerm ||
      numTerm > selectedTariff.maxTerm
    ) {
      alert("Введите корректные значения для выбранного тарифа");
      return;
    }

    console.log("Оформление кредита:");
    console.log("TariffId:", selectedTariff.id);
    console.log("Amount:", numAmount);
    console.log("Term:", numTerm);

    onSubmit(selectedTariff.id, numAmount, numTerm);
    onClose();
  };

  const isValid = selectedTariff
    ? amount !== "" &&
      term !== "" &&
      Number(amount) >= selectedTariff.minAmount &&
      Number(amount) <= selectedTariff.maxAmount &&
      Number(term) >= selectedTariff.minTerm &&
      Number(term) <= selectedTariff.maxTerm
    : false;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Оформить кредит</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Выберите тариф</Form.Label>
            <ListGroup>
              {tariffs.map((tariff) => (
                <OverlayTrigger
                  key={tariff.id}
                  placement="right"
                  overlay={
                    <Tooltip id={`tooltip-${tariff.id}`}>
                      Мин. сумма: {tariff.minAmount} | Макс. сумма: {tariff.maxAmount}<br />
                      Мин. срок: {tariff.minTerm} мес. | Макс. срок: {tariff.maxTerm} мес.<br />
                      Ставка: {tariff.interestRate}%
                    </Tooltip>
                  }
                >
                  <ListGroup.Item
                    action
                    active={selectedTariff?.id === tariff.id}
                    onClick={() => setSelectedTariff(tariff)}
                  >
                    {tariff.name} (Ставка: {tariff.interestRate}%)
                  </ListGroup.Item>
                </OverlayTrigger>
              ))}
            </ListGroup>
          </Form.Group>

          <Form.Label className="mt-3">Сумма</Form.Label>
          <Form.Control
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
            min={selectedTariff?.minAmount}
            max={selectedTariff?.maxAmount}
            step={0.01}
            isInvalid={Boolean(
              selectedTariff &&
              amount !== "" &&
              (Number(amount) < selectedTariff.minAmount ||
                Number(amount) > selectedTariff.maxAmount)
            )}
          />

          <Form.Label className="mt-3">Срок (мес.)</Form.Label>
          <Form.Control
            type="number"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Введите срок"
            min={selectedTariff?.minTerm}
            max={selectedTariff?.maxTerm}
            isInvalid={Boolean(
              selectedTariff &&
              term !== "" &&
              (Number(term) < selectedTariff.minTerm ||
                Number(term) > selectedTariff.maxTerm)
            )}
          />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="primary" disabled={!isValid} onClick={handleSubmit}>Оформить</Button>
      </Modal.Footer>
    </Modal>
  );
};