import { API_BASE_URL } from '../config/env';
import { AUTH_ENDPOINTS } from '../config/api';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  setStoredUser,
  clearSession,
} from './tokenStorage';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = data?.error || null;
    this.fieldErrors = data?.fieldErrors || null;
  }
}

let refreshPromise = null;

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const runRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.refresh}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const body = await parseBody(response);
  if (!response.ok || !body || body.success === false || !body.data) {
    return null;
  }

  setTokens({ accessToken: body.data.accessToken, refreshToken: body.data.refreshToken });
  if (body.data.user) setStoredUser(body.data.user);
  return body.data.accessToken;
};

export const request = async (path, options = {}) => {
  const { method = 'GET', body, auth = true, headers = {}, isRetry = false } = options;

  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !isRetry) {
    if (!refreshPromise) {
      refreshPromise = runRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) {
      return request(path, { ...options, isRetry: true });
    }
    clearSession();
    const parsed = await parseBody(response);
    throw new ApiError(parsed?.message || 'Your session has expired. Please sign in again.', 401, parsed);
  }

  const parsed = await parseBody(response);
  if (!response.ok || (parsed && parsed.success === false)) {
    throw new ApiError(parsed?.message || `Request failed (${response.status})`, response.status, parsed);
  }

  return parsed;
};
