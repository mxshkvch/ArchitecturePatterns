import axios from "axios";

type ApplicationType = "CLIENT" | "EMPLOYEE";

const API_BASE = "http://89.23.105.66:5208/api/bff/push-tokens";
const toTokenSuffix = (token: string): string => token.slice(-12);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const authHeaders = (authToken: string) => ({
  Authorization: `Bearer ${authToken}`,
  "Content-Type": "application/json",
});

export const registerPushToken = async (token: string, applicationType: ApplicationType, authToken: string): Promise<void> => {
  const retries = [0, 500, 1500];
  let lastError: unknown;
  const tokenSuffix = toTokenSuffix(token);

  for (const [attempt, retryDelay] of retries.entries()) {
    if (retryDelay > 0) {
      console.log("Push token registration retry delay", {
        applicationType,
        tokenSuffix,
        delayMs: retryDelay,
        attempt: attempt + 1,
      });
      await delay(retryDelay);
    }

    try {
      console.log("Push token registration request", {
        endpoint: `${API_BASE}/register`,
        applicationType,
        tokenSuffix,
        attempt: attempt + 1,
      });
      await axios.post(
        `${API_BASE}/register`,
        { token, applicationType },
        { headers: authHeaders(authToken) }
      );
      console.log("Push token registration success", {
        applicationType,
        tokenSuffix,
        attempt: attempt + 1,
      });
      return;
    } catch (error) {
      lastError = error;
      console.warn("Push token registration attempt failed", {
        applicationType,
        tokenSuffix,
        attempt: attempt + 1,
        error,
      });
    }
  }

  console.error("Push token registration exhausted retries", {
    applicationType,
    tokenSuffix,
    attempts: retries.length,
    lastError,
  });
  throw lastError;
};

export const unregisterPushToken = async (token: string, applicationType: ApplicationType, authToken: string): Promise<void> => {
  const tokenSuffix = toTokenSuffix(token);
  try {
    console.log("Push token unregister request", {
      endpoint: `${API_BASE}/unregister`,
      applicationType,
      tokenSuffix,
    });
    await axios.post(
      `${API_BASE}/unregister`,
      { token, applicationType },
      { headers: authHeaders(authToken) }
    );
    console.log("Push token unregister success", {
      applicationType,
      tokenSuffix,
    });
  } catch (error) {
    console.warn("Push token unregister failed", {
      applicationType,
      tokenSuffix,
      error,
    });
  }
};
