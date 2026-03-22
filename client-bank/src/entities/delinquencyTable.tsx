import { Table } from "react-bootstrap";
import type { Delinquency } from "../shared/lib/api/creditAnalytics";

type Props = {
  data: Delinquency[];
  theme: string;
};

export const DelinquencyTable = ({ data, theme }: Props) => {
  return (
    <Table
      striped
      bordered
      hover
      className={theme === "DARK" ? "table-dark" : ""}
    >
      <thead>
        <tr>
          <th>Кредит</th>
          <th>Сумма</th>
          <th>Дата платежа</th>
          <th>Просрочка (дней)</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.creditId}>
            <td>{d.creditId}</td>
            <td>{d.remainingAmount.toLocaleString()}</td>
            <td>{new Date(d.dueDate).toLocaleDateString()}</td>
            <td>{d.daysOverdue}</td>
            <td>{d.status}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};