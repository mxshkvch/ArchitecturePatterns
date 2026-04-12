import axios from "axios";

type ApplicationType = "CLIENT" | "EMPLOYEE";

const API_BASE = "http://89.23.105.66:5208/api/bff/push-tokens";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const authHeaders = (authToken: string) => ({
  Authorization: `Bearer ${authToken}`,
  "Content-Type": "application/json",
});

export const registerPushToken = async (token: string, applicationType: ApplicationType, authToken: string): Promise<void> => {
  const retries = [0, 500, 1500];
  let lastError: unknown;

  for (const retryDelay of retries) {
    if (retryDelay > 0) {
      await delay(retryDelay);
    }

    try {
      await axios.post(
        `${API_BASE}/register`,
        { token, applicationType },
        { headers: authHeaders(authToken) }
      );
      return;
    } catch (error) {
      lastError = error;
      console.warn("Push token registration attempt failed", error);
    }
  }

  throw lastError;
};

export const unregisterPushToken = async (token: string, applicationType: ApplicationType, authToken: string): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE}/unregister`,
      { token, applicationType },
      { headers: authHeaders(authToken) }
    );
  } catch (error) {
    console.warn("Push token unregister failed", error);
  }
};
