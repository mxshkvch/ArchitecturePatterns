import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { generateTraceId } from "../monitoring/trace";
import { sendMonitoringLog } from "../monitoring/sendLog";
import { updateMetrics, getErrorPercentage } from "../monitoring/metrics";

const apiClient = axios.create();

const pendingRequests = new Map<string, Promise<any>>();

const getKey = (config: AxiosRequestConfig) =>
  `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;

let failureCount = 0;
let successCount = 0;
let circuitOpenUntil = 0;

const MAX_RETRIES = 3;
const FAILURE_THRESHOLD = 0.7;
const CIRCUIT_TIMEOUT = 10000;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getBackoffDelay = (attempt: number) =>
  300 * Math.pow(2, attempt);

const requestWithRetry = async (
  config: AxiosRequestConfig,
  traceId: string,
  retries = MAX_RETRIES
): Promise<any> => {
  try {
    const response = await apiClient({
      ...config,
      headers: {
        ...config.headers,
        "x-trace-id": traceId,
      },
    });

    successCount++;
    return response;
  } catch (error) {
    const err = error as AxiosError;

    const isServerError =
      typeof err.response?.status === "number" &&
      err.response.status >= 500;

    const isGet = config.method?.toLowerCase() === "get";

    if (isServerError && isGet && retries > 0) {
      failureCount++;

      const attempt = MAX_RETRIES - retries;
      console.warn(`Retry... (${attempt + 1})`);

      await delay(getBackoffDelay(attempt));

      return requestWithRetry(config, traceId, retries - 1);
    }

    failureCount++;
    throw error;
  }
};

export const safeRequest = async (config: AxiosRequestConfig) => {
  const key = getKey(config);
  const traceId = generateTraceId();

  const start = performance.now();

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  if (Date.now() < circuitOpenUntil) {
    const err = new Error("Circuit breaker open");
    (err as any).code = "CIRCUIT_OPEN";
    throw err;
  }

  const promise = (async () => {
    let response: any;
    let error: any;

    try {
      response = await requestWithRetry(config, traceId);
      return response;
    } catch (e) {
      error = e;
      throw e;
    } finally {
      const durationMs = Math.round(performance.now() - start);

      const statusCode =
        response?.status ?? error?.response?.status ?? 0;

      const isError = !!error;

      const metricKey = `${config.method?.toUpperCase()}:${config.url}`;
      updateMetrics(metricKey, isError);

      const errorPercentage = getErrorPercentage(metricKey);

      sendMonitoringLog({
        serviceName: "client-bank",
        method: config.method?.toUpperCase(),
        path: config.url,
        statusCode,
        durationMs,
        errorPercentage,
        traceId,
        isError,
        createdAtUtc: new Date().toISOString(),
      });

      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);

  try {
    return await promise;
  } catch (error) {
    const total = failureCount + successCount;

    if (total > 5) {
      const failureRate = failureCount / total;

      if (failureRate > FAILURE_THRESHOLD) {
        console.warn("Circuit breaker OPEN");

        circuitOpenUntil = Date.now() + CIRCUIT_TIMEOUT;
        failureCount = 0;
        successCount = 0;
      }
    }

    throw error;
  }
};

export default apiClient;