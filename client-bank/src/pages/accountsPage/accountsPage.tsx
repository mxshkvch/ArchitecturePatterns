import { useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Pagination } from "react-bootstrap";
import { CreateAccountModal } from "../../features/accounts/сreateAccountModal"
import { DepositModal } from "../../features/accounts/depositMoneyModal"
import { WithdrawModal } from "../../features/accounts/withdrawMoneyModal"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
  const navigate = useNavigate();

  //cписок счетов (потом перенести в /api)
  const [accountsResponse, setAccountsResponse] = useState<AccountsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const pageSize = 6;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(
          `http://localhost:5000/api/accounts?page=${currentPage}&size=${pageSize}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!response.ok) {
          console.error("Ошибка загрузки:", await response.text());
          return;
        }

        const data: AccountsResponse = await response.json();
        setAccountsResponse(data);
      } catch (error) {
        console.error("Ошибка сети:", error);
      }
    };

    fetchAccounts();
  }, [currentPage]);

  const accounts = accountsResponse?.content ?? [];



  const [showModal, setShowModal] = useState(false);
  const [currency, setCurrency] = useState<"RUB" | "USD">("RUB");
  const [initialDeposit, setInitialDeposit] = useState<string>("")

  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal = () => setShowModal(true);

  //создание счета (потом перенести в /api)
  const handleCreateAccount = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch("http://localhost:5000/api/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        Currency: currency,
        InitialDeposit: Number(initialDeposit) || 0,
      }),
    });

    if (!response.ok) {
      console.error("Ошибка при создании счета:", await response.text());
      return;
    }

    const data = await response.json();
    console.log("Счет создан:", data);

    handleCloseModal();
    setInitialDeposit("");
    setCurrency("RUB");
  } catch (err) {
    console.error("Ошибка сети:", err);
  }
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

  //пополнение счета (потом перенести в /api)
  const handleDeposit = async () => {
  if (!selectedAccountId) return;

  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `http://localhost:5000/api/accounts/${selectedAccountId}/deposit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          Amount: Number(depositAmount) || 0,
          Description: "",
        }),
      }
    );

    if (response.ok) {
      console.log("Депозит успешен");
    } else {
      const text = await response.text(); 
      console.error("Ошибка при депозите:", text);
    }

    setShowDepositModal(false);
    setDepositAmount("");
  } catch (err) {
    console.error("Ошибка сети:", err);
  }
};

//закрыть счет (потом перенести в /api)
const handleCloseAccount = async (accountId: string) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `http://localhost:5000/api/accounts/${accountId}`,
      {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (response.ok) {
      console.log("Счёт успешно закрыт");
    } else {
      const text = await response.text();
      console.error("Ошибка при закрытии счёта:", text);
    }
  } catch (err) {
    console.error("Ошибка сети:", err);
  }
};


//снятие со счета (потом перенести в /api)
const [showWithdrawModal, setShowWithdrawModal] = useState(false);
const [withdrawAmount, setWithdrawAmount] = useState<string>("");

const handleOpenWithdrawModal = (accountId: string) => {
  setSelectedAccountId(accountId);
  setWithdrawAmount("");
  setShowWithdrawModal(true);
};

const handleCloseWithdrawModal = () => {
  setShowWithdrawModal(false);
  setSelectedAccountId(null);
};

const handleWithdraw = async () => {
  if (!selectedAccountId) return;

  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `http://localhost:5000/api/accounts/${selectedAccountId}/withdraw`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          Amount: Number(withdrawAmount) || 0,
          Description: "",
        }),
      }
    );

    if (response.ok) {
      console.log("Снятие успешное");
    } else {
      const text = await response.text();
      console.error("Ошибка при снятии:", text);
    }

    setShowWithdrawModal(false);
    setWithdrawAmount("");
  } catch (err) {
    console.error("Ошибка сети:", err);
  }
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

      <WithdrawModal
        show={showWithdrawModal}
        onClose={handleCloseWithdrawModal}
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        onSubmit={handleWithdraw}
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
                    <Button size="sm" variant="warning" onClick={() => handleOpenWithdrawModal(account.id)} disabled={account.status === "CLOSED"}>Снять</Button>
                    <Button size="sm" variant="info" onClick={() => navigate(`/accounts/${account.id}/transactions`)}>История</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm("Вы уверены, что хотите закрыть этот счет?")) {
                          handleCloseAccount(account.id);
                        }
                      }}
                      disabled={account.status === "CLOSED"}
                    >
                      Закрыть
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
            <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)}/>
            {Array.from(
              { length: accountsResponse?.page.totalPages ?? 0 },(_, i) => (
                <Pagination.Item
                  key={i}
                  active={i === currentPage}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </Pagination.Item>
              )
            )}

            <Pagination.Next disabled={currentPage ===(accountsResponse?.page.totalPages ?? 1) - 1} onClick={() => setCurrentPage((prev) => prev + 1)}/>
          </Pagination>
        </Col>
      </Row>
      </Container>
    </>
  );
};