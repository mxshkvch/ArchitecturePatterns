import { settingsApiClient } from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';

const APP_TYPE = 'EMPLOYEE';
const toTokenSuffix = (token) => token.slice(-12);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const registerPushToken = async (token) => {
  const retries = [0, 500, 1500];
  let lastError;
  const tokenSuffix = toTokenSuffix(token);

  for (const [attempt, retryDelay] of retries.entries()) {
    if (retryDelay > 0) {
      console.log('[push][staff] Push token registration retry delay', {
        applicationType: APP_TYPE,
        tokenSuffix,
        delayMs: retryDelay,
        attempt: attempt + 1,
      });
      await delay(retryDelay);
    }

    try {
      console.log('[push][staff] Push token registration request', {
        endpoint: ENDPOINTS.PUSH_TOKENS.REGISTER,
        applicationType: APP_TYPE,
        tokenSuffix,
        attempt: attempt + 1,
      });
      await settingsApiClient.post(ENDPOINTS.PUSH_TOKENS.REGISTER, {
        token,
        applicationType: APP_TYPE,
      });
      console.log('[push][staff] Push token registration success', {
        applicationType: APP_TYPE,
        tokenSuffix,
        attempt: attempt + 1,
      });
      return;
    } catch (error) {
      lastError = error;
      console.warn('[push][staff] Push token registration attempt failed', {
        applicationType: APP_TYPE,
        tokenSuffix,
        attempt: attempt + 1,
        error,
      });
    }
  }

  console.error('[push][staff] Push token registration exhausted retries', {
    applicationType: APP_TYPE,
    tokenSuffix,
    attempts: retries.length,
    lastError,
  });
  throw lastError;
};

export const unregisterPushToken = async (token) => {
  const tokenSuffix = toTokenSuffix(token);
  try {
    console.log('[push][staff] Push token unregister request', {
      endpoint: ENDPOINTS.PUSH_TOKENS.UNREGISTER,
      applicationType: APP_TYPE,
      tokenSuffix,
    });
    await settingsApiClient.post(ENDPOINTS.PUSH_TOKENS.UNREGISTER, {
      token,
      applicationType: APP_TYPE,
    });
    console.log('[push][staff] Push token unregister success', {
      applicationType: APP_TYPE,
      tokenSuffix,
    });
  } catch (error) {
    console.warn('[push][staff] Push token unregister failed', {
      applicationType: APP_TYPE,
      tokenSuffix,
      error,
    });
  }
};
