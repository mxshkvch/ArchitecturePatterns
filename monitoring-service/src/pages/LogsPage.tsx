import { useEffect, useState } from "react";
import { getLogs, type LogItem } from "../api/logs";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";

interface LogsPageProps {
  onNavigateToMetrics: () => void;
  onNavigateToUsers: () => void;  
}

export default function LogsPage({ onNavigateToMetrics, onNavigateToUsers }: LogsPageProps) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getLogs(page, pageSize);
      setLogs(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="secondary" onClick={onNavigateToUsers}>
          ← Назад к пользователям
        </Button>
        <Button variant="success" onClick={onNavigateToMetrics}>
          📊 Перейти к графикам
        </Button>
      </div>

      <h2 className="mb-3 text-center">Monitoring Logs</h2>

      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Error %</th>
              <th>Error</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.serviceName}</td>
                <td>
                  <Badge bg={log.method === "GET" ? "success" : "primary"}>
                    {log.method}
                  </Badge>
                </td>
                <td>{log.path}</td>
                <td>
                  <Badge bg={log.statusCode >= 400 ? "danger" : "success"}>
                    {log.statusCode}
                  </Badge>
                </td>
                <td>{log.durationMs.toFixed(2)} ms</td>
                <td>{log.errorPercentage.toFixed(2)}%</td>
                <td>{log.isError ? "❌" : "✔️"}</td>
                <td>
                  {new Date(log.createdAtUtc).toLocaleString()}
                 </td>
               </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-center mt-3">
        <div className="btn-group">
          <Button
            variant="outline-primary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹
          </Button>
          <Button variant="outline-primary" disabled>
            {page}
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}