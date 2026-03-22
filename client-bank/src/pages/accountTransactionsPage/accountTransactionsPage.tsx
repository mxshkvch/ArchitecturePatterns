import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useTheme } from "../../shared/lib/provider/themeProvider";
import { fetchTransactionsForAccount } from "../../features/accounts/useCases/fetchTransactions";
import type { Transaction } from "../../shared/lib/api/transactionsHistory";
import { TransactionTable } from "../../entities/transactionTable";
import { PaginationComponent } from "../../shared/ui/components/pagination";
import { SpinnerComponent } from "../../shared/ui/components/spinner";
import { createConnection } from "../../shared/lib/ws/signalR";

export const AccountTransactionsPage = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 6;

  const { theme } = useTheme();

  const refreshTransactions = () => {
    setLoading(true);
    fetchTransactionsForAccount(accountId!, currentPage, pageSize)
      .then(({ transactions, totalPages }) => {
        setTransactions(transactions);
        setTotalPages(totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!accountId) return;
    refreshTransactions();
  }, [accountId, currentPage]);

  useEffect(() => {
  if (!accountId) return;

  const token = localStorage.getItem("accessToken");
  if (!token) return;

  const connection = createConnection(token);
  let timeout: ReturnType<typeof setTimeout>;

  connection.start().then(() => {
    console.log("WS connected");

    connection.on("operationUpdated", (message) => {
      console.log("WS event:", message);

      if (
        message.type === "operation_invalidation" &&
        (message.accountId === accountId || message.targetAccountId === accountId)
      ) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setLoading(true);
          fetchTransactionsForAccount(accountId, currentPage, pageSize)
            .then(({ transactions, totalPages }) => {
              setTransactions(transactions);
              setTotalPages(totalPages);
            })
            .finally(() => setLoading(false));
        }, 300);
      }
    });
  }).catch(err => {
    console.error("Failed to start WS connection:", err);
  });

  return () => {
    connection.stop();
  };
}, [accountId]);

  return (
    <Container className="py-5">
      <h2>История операций по счету {accountId}</h2>

      {loading ? (
        <SpinnerComponent theme={theme} />
      ) : (
        <>
          <TransactionTable transactions={transactions} theme={theme} />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            theme={theme}
          />
        </>
      )}
    </Container>
  );
};