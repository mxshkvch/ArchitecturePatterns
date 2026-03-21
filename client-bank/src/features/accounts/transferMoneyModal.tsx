import type { FC } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import type { Account } from "../../shared/lib/api/accounts";
import { useState } from "react";

type Props = {
  show: boolean;
  onClose: () => void;
  accounts: Account[];
  fromAccountId: string | null;
  targetOwnAccountId: string;
  setTargetOwnAccountId: (value: string) => void;
  targetForeignAccountId: string;
  setTargetForeignAccountId: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  onSubmit: (finalTargetId: string, amount: number) => void;
};

export const TransferModal: FC<Props> = ({
  show,
  onClose,
  accounts,
  fromAccountId,
  targetOwnAccountId,
  setTargetOwnAccountId,
  targetForeignAccountId,
  setTargetForeignAccountId,
  amount,
  setAmount,
  onSubmit,
}) => {
  const [transferType, setTransferType] = useState<"own" | "foreign">("own");

  const handleSubmit = () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Введите корректную сумму");
      return;
    }

    if (!fromAccountId) {
      alert("Выберите счет списания");
      return;
    }

    const fromAccount = accounts.find(a => a.id === fromAccountId);
    if (!fromAccount) {
      alert("Счет списания не найден");
      return;
    }

    if (numAmount > fromAccount.balance) {
      alert("Нельзя перевести больше, чем есть на счете");
      return;
    }

    const finalTargetId = transferType === "own" ? targetOwnAccountId : targetForeignAccountId;
    if (!finalTargetId) {
      alert("Укажите счет получателя");
      return;
    }

    if (finalTargetId === fromAccountId) {
      alert("Нельзя перевести на тот же счет");
      return;
    }

    if (transferType === "foreign" && !/^[0-9a-fA-F-]{36}$/.test(finalTargetId)) {
      alert("Некорректный ID чужого счета");
      return;
    }

    onSubmit(finalTargetId, numAmount);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Перевод средств</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Тип перевода</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="На свой счет"
                name="transferType"
                checked={transferType === "own"}
                onChange={() => setTransferType("own")}
              />
              <Form.Check
                inline
                type="radio"
                label="На чужой счет"
                name="transferType"
                checked={transferType === "foreign"}
                onChange={() => setTransferType("foreign")}
              />
            </div>
          </Form.Group>

          {transferType === "own" && (
            <Form.Group className="mb-3">
              <Form.Label>Счета (свои)</Form.Label>
              <Form.Select
                value={targetOwnAccountId}
                onChange={(e) => setTargetOwnAccountId(e.target.value)}
              >
                <option value="">Выберите счет</option>
                {accounts
                  .filter((a) => a.id !== fromAccountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountNumber} ({a.currency})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          )}

          {transferType === "foreign" && (
            <Form.Group className="mb-3">
              <Form.Label>ID чужого счета</Form.Label>
              <Form.Control
                type="text"
                value={targetForeignAccountId}
                onChange={(e) => setTargetForeignAccountId(e.target.value)}
                placeholder="UUID счета"
              />
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label>Сумма</Form.Label>
            <Form.Control
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) setAmount(val);
              }}
              placeholder="Введите сумму"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="primary" onClick={handleSubmit}>Перевести</Button>
      </Modal.Footer>
    </Modal>
  );
};