import { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import type { Tariff } from "../../shared/lib/api/credits";

type ApplyCreditModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (tariffId: string, amount: number, term: number) => void;
  tariffs: Tariff[];
  loading: boolean;
  error: string | null;
};

export const ApplyCreditModal = ({show, onClose, onSubmit, tariffs, loading, error }: ApplyCreditModalProps) => {
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [amount, setAmount] = useState<number | string>("");
  const [term, setTerm] = useState<number | string>("");

  useEffect(() => {
    if (!show) {
      setSelectedTariff(null);
      setAmount("");
      setTerm("");
    }
  }, [show]);

  const handleSubmit = () => {
    if (!selectedTariff) return;
    const numAmount = Number(amount);
    const numTerm = Number(term);

    if (numAmount < selectedTariff.minAmount || numAmount > selectedTariff.maxAmount || numTerm < selectedTariff.minTerm || numTerm > selectedTariff.maxTerm) {
      return;
    }

    onSubmit(selectedTariff.id, numAmount, numTerm);
    onClose();
  };

  const isAmountInvalid = selectedTariff && amount !== "" && (Number(amount) < selectedTariff.minAmount || Number(amount) > selectedTariff.maxAmount);
  const isTermInvalid = selectedTariff && term !== "" && (Number(term) < selectedTariff.minTerm || Number(term) > selectedTariff.maxTerm);

  const isValid =
    selectedTariff &&
    amount !== "" &&
    term !== "" &&
    !isAmountInvalid &&
    !isTermInvalid;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Оформить кредит</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && <p>Загрузка тарифов...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && tariffs.length === 0 && <p>Нет доступных тарифов</p>}

        {!loading && !error && tariffs.length > 0 && (
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
                        Мин. сумма: {tariff.minAmount} | Макс. сумма: {tariff.maxAmount}
                        <br />
                        Мин. срок: {tariff.minTerm} мес. | Макс. срок: {tariff.maxTerm} мес.
                        <br />
                        Ставка: {tariff.interestRate}%
                      </Tooltip>
                    }
                    container={document.body}
                  >
                    <ListGroup.Item
                      action
                      active={selectedTariff?.id === tariff.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedTariff(tariff);
                      }}
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
              isInvalid={!!isAmountInvalid}
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
            />
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" type="button" onClick={onClose}>Отмена</Button>
        <Button variant="primary" type="button" disabled={!isValid} onClick={handleSubmit}>Оформить</Button>
      </Modal.Footer>
    </Modal>
  );
};