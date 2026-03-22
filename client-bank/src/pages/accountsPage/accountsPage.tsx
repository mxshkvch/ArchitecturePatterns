import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { useAccountsPage } from "../../features/accounts/useCases/useAccountsPage";
import { AccountCard } from "../../entities/accountCard";
import { SpinnerComponent } from "../../shared/ui/components/spinner";
import { PaginationComponent } from "../../shared/ui/components/pagination";
import { CreateAccountModal } from "../../features/accounts/сreateAccountModal";
import { DepositModal } from "../../features/accounts/depositMoneyModal";
import { WithdrawModal } from "../../features/accounts/withdrawMoneyModal";
import { TransferModal } from "../../features/accounts/transferMoneyModal";

export const AccountsPage = () => {
  const navigate = useNavigate();
  const pageSize = 6;

  const {
    accountsResponse,
    accounts,
    allAccounts,
    currentPage,
    setCurrentPage,
    handleCreateAccount,
    handleDeposit,
    handleWithdraw,
    handleCloseAccount,
    handleTransfer,
    toggleHideAccount,
  } = useAccountsPage(pageSize);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"RUB" | "USD" | "EUR">("RUB");
  const [initialDeposit, setInitialDeposit] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [targetAccountId, setTargetAccountId] = useState<string>("");

  if (!accountsResponse) return <SpinnerComponent theme="LIGHT" />;

  const handleClose = async (accountId: string, balance: number) => {
    try {
      await handleCloseAccount(accountId, balance);
    } catch (err: any) {
      alert(err.message || "Ошибка при закрытии счета");
    }
  };

  const handleCreateAccountScenario = async (amount: number) => {
  try {
    await handleCreateAccount(currency, amount);
    setShowCreateModal(false);
    setInitialDeposit("");
  } catch (err) {
    console.error("Ошибка при создании счета:", err);
    alert("Не удалось открыть счет");
  }
};

const handleDepositScenario = async (accountId: string, amount: number) => {
  try {
    await handleDeposit(accountId, amount);
    setShowDepositModal(false);
    setDepositAmount("");
  } catch (err) {
    console.error("Ошибка при пополнении:", err);
    alert("Не удалось пополнить счет");
  }
};

const handleWithdrawScenario = async (accountId: string, amount: number) => {
  try {
    await handleWithdraw(accountId, amount);
    setShowWithdrawModal(false);
    setWithdrawAmount("");
  } catch (err) {
    console.error("Ошибка при снятии:", err);
    alert("Не удалось снять деньги");
  }
};

const handleTransferScenario = async (fromId: string, toId: string, amount: number) => {
  try {
    await handleTransfer(fromId, toId, amount);
    setShowTransferModal(false);
    setTransferAmount("");
    setTargetAccountId("");
  } catch (err: any) {
    if (err.response?.status === 404) alert("Счет получателя не найден");
    else alert(err.response?.data?.message || "Ошибка при переводе");
  }
};

  return (
    <Container className="py-5">
      <CreateAccountModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currency={currency}
        setCurrency={setCurrency}
        initialDeposit={initialDeposit}
        setInitialDeposit={setInitialDeposit}
        onCreate={(amount) => handleCreateAccountScenario(amount)}
      />

      <DepositModal
        show={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        amount={depositAmount}
        setAmount={setDepositAmount}
        onSubmit={() => selectedAccountId && handleDepositScenario(selectedAccountId, Number(depositAmount))}
      />

      <WithdrawModal
        show={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        onSubmit={() => selectedAccountId && handleWithdrawScenario(selectedAccountId, Number(withdrawAmount))}
      />

      <TransferModal
        show={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        accounts={allAccounts}
        fromAccountId={selectedAccountId}
        targetOwnAccountId={targetAccountId}
        setTargetOwnAccountId={setTargetAccountId}
        targetForeignAccountId={targetAccountId}
        setTargetForeignAccountId={setTargetAccountId}
        amount={transferAmount}
        setAmount={setTransferAmount}
        onSubmit={(finalTargetId, amount) =>
          selectedAccountId && handleTransferScenario(selectedAccountId, finalTargetId, amount)
        }
      />

      <Row className="mb-4">
        <Col><h2>Мои счета</h2></Col>
        <Col className="text-end">
          <Button variant="success" onClick={() => setShowCreateModal(true)}>+ Открыть новый счёт</Button>
        </Col>
      </Row>

      {accounts.length === 0 ? (
        <Row className="mt-5">
          <Col className="text-center">
            <p>У вас пока нет счетов.</p>
          </Col>
        </Row>
      ) : (
        <>
          <Row>
            {accounts.map(account => (
              <Col md={6} key={account.id} className="mb-4">
                <AccountCard
                  account={account}
                  onDeposit={(id) => { setSelectedAccountId(id); setDepositAmount(""); setShowDepositModal(true); }}
                  onWithdraw={(id) => { setSelectedAccountId(id); setWithdrawAmount(""); setShowWithdrawModal(true); }}
                  onTransfer={(id) => { setSelectedAccountId(id); setTransferAmount(""); setTargetAccountId(""); setShowTransferModal(true); }}
                  onClose={(id) => handleClose(id, account.balance)}
                  onToggleHide={toggleHideAccount}
                  onHistory={(id) => navigate(`/accounts/${id}/transactions`)}
                />
              </Col>
            ))}
          </Row>

          {accounts.length > 0 && (
            <Row className="mt-4">
              <Col>
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={accountsResponse.page.totalPages}
                  onPageChange={setCurrentPage}
                  theme="LIGHT"
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};