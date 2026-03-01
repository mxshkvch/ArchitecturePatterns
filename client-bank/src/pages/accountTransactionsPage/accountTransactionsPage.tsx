import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Table, Pagination, Spinner } from "react-bootstrap";

type Transaction = {
  id: string;
  accountId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
};

type TransactionsResponse = {
  content: Transaction[];
  page: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export const AccountTransactionsPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(0);

  const fetchTransactions = async (page: number) => {
    if (!accountId) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5000/api/accounts/${accountId}/transactions?page=${page}&size=${pageSize}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Ошибка при загрузке транзакций:", text);
        return;
      }

      const data: TransactionsResponse = await response.json();
      setTransactions(data.content);
      setTotalPages(data.page.totalPages);
    } catch (error) {
      console.error("Ошибка сети при загрузке транзакций:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [accountId, currentPage]);

  return (
    <Container className="py-5">
      <h2>История операций по счету {accountId}</h2>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Сумма</th>
                <th>Баланс после</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.timestamp).toLocaleString()}</td>
                  <td>{txn.type}</td>
                  <td>{txn.amount.toLocaleString()}</td>
                  <td>{txn.balanceAfter.toLocaleString()}</td>
                  <td>{txn.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i}
                  active={i === currentPage}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              />
            </Pagination>
          </div>
        </>
      )}
    </Container>
  );
};