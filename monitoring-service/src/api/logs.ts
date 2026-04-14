import axios from "axios";

export interface LogItem {
  id: number;
  serviceName: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  errorPercentage: number;
  traceId: string;
  isError: boolean;
  createdAtUtc: string;
}

export interface LogsResponse {
  page: number;
  pageSize: number;
  data: LogItem[];
}

const BASE_URL = "http://89.23.105.66:5300";

export const getLogs = async (page: number, pageSize: number) => {
  const res = await axios.get<LogsResponse>(
    `${BASE_URL}/api/monitoring/logs`,
    {
      params: { page, pageSize },
    }
  );

  return res.data;
};