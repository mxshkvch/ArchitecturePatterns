import axios, { AxiosError, type AxiosRequestConfig } from "axios";

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
  retries = MAX_RETRIES
): Promise<any> => {
  try {
    const response = await apiClient(config);
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

      return requestWithRetry(config, retries - 1);
    }

    failureCount++;
    throw error;
  }
};

export const safeRequest = async (config: AxiosRequestConfig) => {
  const key = getKey(config);

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  if (Date.now() < circuitOpenUntil) {
    const err = new Error("Circuit breaker open");
    (err as any).code = "CIRCUIT_OPEN";
    throw err;
  }

  const promise = (async () => {
    try {
      return await requestWithRetry(config);
    } finally {
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