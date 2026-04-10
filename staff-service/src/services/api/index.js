import { authService } from './auth/authService';
import { userService } from './user/userService';
import { creditService } from './credit/creditService';
import { coreService } from './core/coreService';
import { settingsService } from './settings/settingsService';
import { tokenManager } from './auth/tokenManager';
import { ENDPOINTS } from './config/endpoints';
export { userApiClient, creditApiClient, coreApiClient, settingsApiClient, authApiClient } from './config/axiosConfig';

export {
  authService,
  userService,
  creditService,
  coreService,
  settingsService,
  tokenManager,
};

export const getTokenFromUrl = () => tokenManager.getTokenFromUrl();
export const getAuthToken = () => tokenManager.getToken();
export const isAuthenticated = () => tokenManager.isAuthenticated();
export const logout = () => authService.logout();
export const initializeAuth = () => authService.initialize();

export const login = (email, password) => authService.login(email, password);
export const getUsers = (page, size, role) => userService.getUsers(page, size, role);
export const createUser = (userData) => userService.createUser(userData);
export const updateUserStatus = (userId, status) => userService.updateUserStatus(userId, status);
export const getUserById = (userId) => userService.getUserById(userId);
export const getCredits = (page, size) => creditService.getCredits(page, size);
export const createCreditTariff = (tariffData) => creditService.createCreditTariff(tariffData);
export const getUserRating = (userId) => creditService.getUserRating(userId);
export const getUserAccounts = (userId, page, size, status) => coreService.getUserAccounts(userId, page, size, status);
export const getAccountTransactions = (accountId, page, size, fromDate, toDate) => coreService.getAccountTransactions(accountId, page, size, fromDate, toDate);
export const getMasterAccount = () => coreService.getMasterAccount();
export const getSettings = (applicationType) => settingsService.getSettings(applicationType);
export const updateSettings = (settings) => settingsService.updateSettings(settings);

export { ENDPOINTS };