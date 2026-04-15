import { useState } from "react";
import LogsPage from "./pages/LogsPage";
import MetricsPage from "./pages/MetricsPage";

function App() {
  const [currentPage, setCurrentPage] = useState<"logs" | "metrics" | "users">("logs");

  const handleNavigateToUsers = () => {
    window.location.href = 'http://localhost:5173/users';
  };

  const handleNavigateToLogs = () => {
    setCurrentPage("logs");
  };

  const handleNavigateToMetrics = () => {
    setCurrentPage("metrics");
  };

  return (
    <div>
      {currentPage === "logs" ? (
        <LogsPage 
          onNavigateToMetrics={handleNavigateToMetrics}
          onNavigateToUsers={handleNavigateToUsers}
        />
      ) : currentPage === "metrics" ? (
        <MetricsPage onNavigateToLogs={handleNavigateToLogs} />
      ) : null}
    </div>
  );
}

export default App;