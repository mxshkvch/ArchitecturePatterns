import { useState, useEffect } from 'react';
import { resilienceMonitor } from '../../services/resilience/monitoring';
export function useCircuitBreakerStatus(serviceName) {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    const updateStatus = () => {
      const allStatuses = resilienceMonitor.getAllStatuses();
      setStatus(allStatuses[serviceName] || null);
    };
    
    resilienceMonitor.subscribe(updateStatus);
    updateStatus();
    
    return () => {
    };
  }, [serviceName]);
  
  return status;
}

export function CircuitBreakerIndicator({ serviceName }) {
  const status = useCircuitBreakerStatus(serviceName);
  
  if (!status) return null;
  
  const hasOpenBreakers = Object.values(status).some(s => s.state === 'OPEN');
  
  if (!hasOpenBreakers) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <span>⚠️</span>
        <span>Service {serviceName} temporarily unavailable</span>
      </div>
    </div>
  );
}