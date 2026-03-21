import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CreateAccountModal } from "../../features/accounts/сreateAccountModal";
import { DepositModal } from "../../features/accounts/depositMoneyModal";
import { WithdrawModal } from "../../features/accounts/withdrawMoneyModal";

import { fetchAccounts, fetchAllAccounts, createAccount, depositToAccount, withdrawFromAccount, closeAccount  } from "../../shared/lib/api/accounts";
import type { AccountsResponse, Account  } from "../../shared/lib/api/accounts";

import { TransferModal } from "../../features/accounts/transferMoneyModal";
import { transferBetweenAccounts } from "../../shared/lib/api/accounts";

export const AccountsPage = () => {
  const navigate = useNavigate();

  const [accountsResponse, setAccountsResponse] = useState<AccountsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;

  const [showModal, setShowModal] = useState(false);
  const [currency, setCurrency] = useState<"RUB" | "USD" | "EUR">("RUB");
  const [initialDeposit, setInitialDeposit] = useState<string>("");

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");


  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>("");

  const [targetOwnAccountId, setTargetOwnAccountId] = useState("");
  const [targetForeignAccountId, setTargetForeignAccountId] = useState("");
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const loadAccounts = async () => {
      console.log("Обновление счетов:", new Date().toLocaleTimeString());
      try {
        const data = await fetchAccounts(currentPage, pageSize);
        setAccountsResponse(data);
      } catch (err) {
        console.error("Ошибка загрузки счетов:", err);
      }
    };

    loadAccounts();

    const interval = setInterval(loadAccounts, 60_000); 
    return () => clearInterval(interval);
  }, [currentPage]);

  const accounts = accountsResponse?.content ?? [];

  useEffect(() => {
    const loadAllAccounts = async () => {
      try {
        const data = await fetchAllAccounts();
        setAllAccounts(data);
      } catch (err) {
        console.error("Ошибка загрузки всех счетов:", err);
      }
    };

    loadAllAccounts();
  }, []);

  

  const handleCreateAccount = async () => {
    try {
      await createAccount(currency, Number(initialDeposit) || 0);
      setShowModal(false);
      setCurrency("RUB");
      setInitialDeposit("");
      const data = await fetchAccounts(currentPage, pageSize);
      setAccountsResponse(data);
    } catch (err) {
      console.error("Ошибка при создании счета:", err);
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccountId) return;
    try {
      await depositToAccount(selectedAccountId, Number(depositAmount) || 0);
      setShowDepositModal(false);
      setDepositAmount("");
      const data = await fetchAccounts(currentPage, pageSize);
      setAccountsResponse(data);
    } catch (err) {
      console.error("Ошибка при депозите:", err);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccountId) return;

    const account = accounts.find(a => a.id === selectedAccountId);
    const numAmount = Number(withdrawAmount);

    if (!account) return;

    if (numAmount <= 0) {
      alert("Введите сумму больше 0");
      return;
    }

    if (numAmount > account.balance) {
      alert("Нельзя снять больше, чем есть на счете");
      return;
    }

    try {
      await withdrawFromAccount(selectedAccountId, numAmount);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      const data = await fetchAccounts(currentPage, pageSize);
      setAccountsResponse(data);
    } catch (err) {
      console.error("Ошибка при снятии:", err);
    }
  };

  const handleCloseAccount = async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    if (account.balance > 0) {
      alert("Нельзя закрыть счет, пока на нём есть средства");
      return;
    }

    try {
      await closeAccount(accountId);
      const data = await fetchAccounts(currentPage, pageSize);
      setAccountsResponse(data);
    } catch (err) {
      console.error("Ошибка при закрытии счета:", err);
    }
  };

  const handleTransfer = async (finalTargetId: string, amount: number) => {
    if (!selectedAccountId) return;

    try {
      await transferBetweenAccounts(selectedAccountId, finalTargetId, amount);

      setShowTransferModal(false);
      setTransferAmount("");
      setTargetOwnAccountId("");
      setTargetForeignAccountId("");

      const data = await fetchAccounts(currentPage, pageSize);
      setAccountsResponse(data);

      const all = await fetchAllAccounts();
      setAllAccounts(all);
    } catch (err) {
      console.error("Ошибка перевода:", err);
      alert("Ошибка перевода. Проверьте счет получателя и баланс.");
    }
  };

 
  return (
    <>
      <CreateAccountModal
        show={showModal}
        onClose={() => setShowModal(false)}
        currency={currency}
        setCurrency={setCurrency}
        initialDeposit={initialDeposit}
        setInitialDeposit={setInitialDeposit}
        onCreate={handleCreateAccount}
      />

      <DepositModal
        show={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        amount={depositAmount}
        setAmount={setDepositAmount}
        onSubmit={handleDeposit}
      />

      <WithdrawModal
        show={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        onSubmit={handleWithdraw}
      />

      <TransferModal
        show={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        accounts={allAccounts}
        fromAccountId={selectedAccountId}
        targetOwnAccountId={targetOwnAccountId}
        setTargetOwnAccountId={setTargetOwnAccountId}
        targetForeignAccountId={targetForeignAccountId}
        setTargetForeignAccountId={setTargetForeignAccountId}
        amount={transferAmount}
        setAmount={setTransferAmount}
        onSubmit={handleTransfer}
      />

      <Container className="py-5">
        <Row className="mb-4">
          <Col><h2>Мои счета</h2></Col>
          <Col className="text-end">
            <Button variant="success" onClick={() => setShowModal(true)}>+ Открыть новый счёт</Button>
          </Col>
        </Row>

        <Row>
          {accounts.map(account => (
            <Col md={6} key={account.id} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>№ {account.accountNumber}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Открыт: {new Date(account.createdAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Card.Subtitle>
                  <h4 className="my-3">
                    {account.balance.toLocaleString()} {account.currency}
                  </h4>
                  <Badge bg={account.status === "ACTIVE" ? "success" : "secondary"} className="mb-3">
                    {account.status}
                  </Badge>

                  <div className="d-flex gap-2 flex-wrap">
                    <Button size="sm" variant="primary" onClick={() => { setSelectedAccountId(account.id); setDepositAmount(""); setShowDepositModal(true); }} disabled={account.status === "CLOSED"}>Внести</Button>
                    <Button size="sm" variant="warning" onClick={() => { setSelectedAccountId(account.id); setWithdrawAmount(""); setShowWithdrawModal(true); }} disabled={account.status === "CLOSED"}>Снять</Button>
                    <Button size="sm" variant="info" onClick={() => navigate(`/accounts/${account.id}/transactions`)}>История</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm("Вы уверены, что хотите закрыть этот счет?")) handleCloseAccount(account.id);
                      }}
                      disabled={account.status === "CLOSED"}
                    >
                      Закрыть
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedAccountId(account.id);
                        setTransferAmount("");
                        setTargetOwnAccountId("");
                        setTargetForeignAccountId("");
                        setShowTransferModal(true);
                      }}
                      disabled={account.status === "CLOSED"}
                    >
                      Перевести
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)} />
              {Array.from({ length: accountsResponse?.page.totalPages ?? 0 }, (_, i) => (
                <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === (accountsResponse?.page.totalPages ?? 1) - 1} onClick={() => setCurrentPage(prev => prev + 1)} />
            </Pagination>
          </Col>
        </Row>
      </Container>
    </>
  );
};