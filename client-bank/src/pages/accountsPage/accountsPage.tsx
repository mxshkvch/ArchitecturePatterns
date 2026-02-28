import { useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Pagination } from "react-bootstrap";
import { CreateAccountModal } from "../../features/accounts/сreateAccountModal"
import { DepositModal } from "../../features/accounts/depositMoneyModal"

type Account = {
  id: string;
  accountNumber: string;
  userId: string;
  balance: number;
  currency: string;
  status: "ACTIVE" | "CLOSED";
  createdAt: string;
  closedAt: string | null;
};

type AccountsResponse = {
  content: Account[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export const AccountsPage = () => {
  const allAccountsResponse: AccountsResponse = {
    content: Array.from({ length: 12 }, (_, i) => ({
      id: `account-${i + 1}`,
      accountNumber: `40817810099910${i + 4300}`,
      userId: `user-${i + 1}`,
      balance: 1000 * (i + 1),
      currency: i % 2 === 0 ? "RUB" : "USD",
      status: i % 3 === 0 ? "CLOSED" : "ACTIVE",
      createdAt: `2026-02-${i + 1}`,
      closedAt: null,
    })),
    page: {
      page: 0,
      size: 5,
      totalElements: 12,
      totalPages: Math.ceil(12 / 5),
    },
  };

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = allAccountsResponse.page.size;
  const accounts = allAccountsResponse.content.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const [showModal, setShowModal] = useState(false);
  const [currency, setCurrency] = useState<"RUB" | "USD">("RUB");
  const [initialDeposit, setInitialDeposit] = useState<string>("")

  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal = () => setShowModal(true);

  const handleCreateAccount = () => {
    console.log("Создан счёт:", { currency, initialDeposit });
    handleCloseModal();
  };

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");

  const handleOpenDepositModal = (accountId: string) => {
    setSelectedAccountId(accountId);
    setDepositAmount("");
    setShowDepositModal(true);
  };

  const handleCloseDepositModal = () => {
    setShowDepositModal(false);
    setSelectedAccountId(null);
  };

  const handleDeposit = () => {
    console.log(`POST /accounts/${selectedAccountId}/deposit`);
    handleCloseDepositModal();
  };

  return (
    <>
      <CreateAccountModal
        show={showModal}
        onClose={handleCloseModal}
        currency={currency}
        setCurrency={setCurrency}
        initialDeposit={initialDeposit}
        setInitialDeposit={setInitialDeposit}
        onCreate={handleCreateAccount}
      />

      <DepositModal
        show={showDepositModal}
        onClose={handleCloseDepositModal}
        amount={depositAmount}
        setAmount={setDepositAmount}
        onSubmit={handleDeposit}
      />

      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h2>Мои счета</h2>
          </Col>
          <Col className="text-end">
            <Button variant="success" onClick={handleOpenModal}>+ Открыть новый счёт</Button>
          </Col>
        </Row>

        <Row>
          {accounts.map((account) => (
            <Col md={6} key={account.id} className="mb-4">
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>№ {account.accountNumber}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Открыт: {account.createdAt}
                  </Card.Subtitle>
                  <h4 className="my-3">
                    {account.balance.toLocaleString()} {account.currency}
                  </h4>
                  <Badge
                    bg={account.status === "ACTIVE" ? "success" : "secondary"}
                    className="mb-3"
                  >
                    {account.status}
                  </Badge>

                  <div className="d-flex gap-2 flex-wrap">
                    <Button size="sm" variant="primary" onClick={() => handleOpenDepositModal(account.id)} disabled={account.status === "CLOSED"}>Внести</Button>
                    <Button size="sm" variant="warning">Снять</Button>
                    <Button size="sm" variant="info">История</Button>
                    <Button size="sm" variant="danger">Закрыть</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              />
              {Array.from({ length: allAccountsResponse.page.totalPages }, (_, i) => (
                <Pagination.Item
                  key={i}
                  active={i === currentPage}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === allAccountsResponse.page.totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </Pagination>
          </Col>
        </Row>
      </Container>
    </>
  );
};