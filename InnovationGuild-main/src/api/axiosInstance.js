import axios from 'axios';
import { getToken, setToken, clearToken, isTokenExpired } from '../utils/tokenStore';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

function redirectToLogin() {
  // Read the role BEFORE logout() nulls it, so admins land on /admin/login
  const { userRole } = store.getState().auth;
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  clearToken();
  store.dispatch(logout());
  window.location.href = isAdmin ? '/admin/login' : '/login';
}

/**
 * Refresh the access token — safe across multiple tabs and multiple
 * simultaneous callers within one tab.
 *
 * navigator.locks queues all callers on a cross-tab named mutex.
 * Each caller checks if the token was already refreshed by the previous
 * holder. If valid: return it. If expired: do the network call.
 * Result: exactly ONE refresh request reaches the server.
 */
export async function refreshAccessToken() {
  return navigator.locks.request('ig_token_refresh', async () => {
    const existing = getToken();
    if (existing && !isTokenExpired(existing)) return existing; // already refreshed

    const res = await axios.post(`${BASE_URL}/auth/refresh`, null, { withCredentials: true });
    const newToken = res.data.data.accessToken;
    setToken(newToken);
    return newToken;
  });
}

// ── Request interceptor ───────────────────────────────────────────────────────
// Proactively refresh before file uploads to avoid ERR_CONNECTION_RESET mid-upload
api.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']; // let browser set multipart boundary
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      try {
        const newToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      } catch (refreshErr) {
        // Only log out if the session is genuinely dead (refresh returned 401).
        // A transient network error must NOT log the user out.
        if (refreshErr?.response?.status === 401) redirectToLogin();
        return Promise.reject(refreshErr);
      }
    }
  }

  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
const PUBLIC_AUTH_RE = /\/(auth\/(login|register|verify-email|mobile-login|mobile-verify|forgot-password|reset-password|resend-otp|resend-mobile-otp)|public\/)/;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    const is401 = error.response?.status === 401;
    // ERR_CONNECTION_RESET: backend closes conn mid-upload on auth failure
    const isConnErr = !error.response && !!error.request;
    const isRefreshUrl = orig.url?.includes('/auth/refresh');
    const isPublic = PUBLIC_AUTH_RE.test(orig.url ?? '');

    if ((is401 || isConnErr) && !orig._retry && !isRefreshUrl && !isPublic) {
      orig._retry = true;
      try {
        const newToken = await refreshAccessToken();
        orig.headers.Authorization = `Bearer ${newToken}`;
        return api(orig);
      } catch (refreshErr) {
        // Session is only truly dead if the refresh endpoint itself returned 401.
        // A network error (no response) must NOT log the user out.
        if (refreshErr?.response?.status === 401) redirectToLogin();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
