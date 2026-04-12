import { settingsApiClient } from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';

const APP_TYPE = 'EMPLOYEE';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const registerPushToken = async (token) => {
  const retries = [0, 500, 1500];
  let lastError;

  for (const retryDelay of retries) {
    if (retryDelay > 0) {
      await delay(retryDelay);
    }

    try {
      await settingsApiClient.post(ENDPOINTS.PUSH_TOKENS.REGISTER, {
        token,
        applicationType: APP_TYPE,
      });
      return;
    } catch (error) {
      lastError = error;
      console.warn('Push token registration attempt failed', error);
    }
  }

  throw lastError;
};

export const unregisterPushToken = async (token) => {
  try {
    await settingsApiClient.post(ENDPOINTS.PUSH_TOKENS.UNREGISTER, {
      token,
      applicationType: APP_TYPE,
    });
  } catch (error) {
    console.warn('Push token unregister failed', error);
  }
};
