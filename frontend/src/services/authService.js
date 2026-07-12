import { request } from './apiClient';
import { AUTH_ENDPOINTS } from '../config/api';
import { setSession, clearSession, getRefreshToken } from './tokenStorage';

export const login = async (email, password) => {
  const response = await request(AUTH_ENDPOINTS.login, {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  const data = response.data;
  setSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  });
  return data.user;
};

export const signup = (payload) =>
  request(AUTH_ENDPOINTS.signup, { method: 'POST', auth: false, body: payload });

export const registerOrganization = (payload) =>
  request(AUTH_ENDPOINTS.registerOrganization, { method: 'POST', auth: false, body: payload });

export const fetchCurrentUser = async () => {
  const response = await request(AUTH_ENDPOINTS.me);
  return response.data;
};

export const logout = async () => {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await request(AUTH_ENDPOINTS.logout, { method: 'POST', auth: false, body: { refreshToken } });
    }
  } catch {
    clearSession();
  } finally {
    clearSession();
  }
};

export const forgotPassword = (email) =>
  request(AUTH_ENDPOINTS.forgotPassword, { method: 'POST', auth: false, body: { email } });

export const resetPassword = (token, newPassword) =>
  request(AUTH_ENDPOINTS.resetPassword, { method: 'POST', auth: false, body: { token, newPassword } });

export const resendVerification = (email) =>
  request(AUTH_ENDPOINTS.resendVerification, { method: 'POST', auth: false, body: { email } });

export const verifyEmail = (token) =>
  request(AUTH_ENDPOINTS.verifyEmail, { method: 'POST', auth: false, body: { token } });

export const changePassword = (currentPassword, newPassword) =>
  request(AUTH_ENDPOINTS.changePassword, { method: 'POST', body: { currentPassword, newPassword } });
