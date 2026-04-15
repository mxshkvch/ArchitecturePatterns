const API_BASE_URL = "http://89.23.105.66:5300/api/monitoring";

export interface MetricsData {
  totalRequests: number;
  errorCount: number;
  errorPercentage: number;
  avgDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
}

export async function getMetrics(): Promise<MetricsData> {
  const response = await fetch(`${API_BASE_URL}/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.status}`);
  }
  return response.json();
}