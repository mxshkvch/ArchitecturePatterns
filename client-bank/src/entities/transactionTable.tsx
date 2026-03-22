import { Table } from "react-bootstrap";
import type { Transaction } from "../shared/lib/api/transactionsHistory";

type TransactionTableProps = {
  transactions: Transaction[];
  theme: "LIGHT" | "DARK";
};

export const TransactionTable = ({ transactions, theme }: TransactionTableProps) => (
  <Table striped bordered hover variant={theme === "DARK" ? "dark" : "light"}>
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
);