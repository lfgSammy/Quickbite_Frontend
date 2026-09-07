import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const client = axios.create({ baseURL });

export function getTokens() {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  };
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

const CART_TOKEN_KEY = 'cart_token';

// A guest cart is identified only by this token, so it lives in localStorage
// and rides along on every request until the cart is claimed at login.
export function getCartToken() {
  try {
    return localStorage.getItem(CART_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setCartToken(token) {
  try {
    if (token) localStorage.setItem(CART_TOKEN_KEY, token);
  } catch {
    /* private browsing - the cart just won't survive a reload */
  }
}

export function clearCartToken() {
  try {
    localStorage.removeItem(CART_TOKEN_KEY);
  } catch {
    /* nothing to do */
  }
}

// Cart responses carry the token while the cart has no owner. Capturing it
// here means callers never have to think about it.
export function rememberCart(data) {
  if (data?.is_guest && data?.token) setCartToken(data.token);
  else if (data && data.is_guest === false) clearCartToken();
  return data;
}

client.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  const cartToken = getCartToken();
  if (cartToken) {
    config.headers['X-Cart-Token'] = cartToken;
  }
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenIssuanceEndpoint = [
      '/auth/login/',
      '/auth/register/',
      '/auth/refresh/',
      '/auth/google/',
    ].some((path) => originalRequest?.url?.includes(path));

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isTokenIssuanceEndpoint
    ) {
      const { refresh } = getTokens();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${baseURL}/auth/refresh/`, { refresh })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        setTokens({ access: data.access });
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return client(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Paginated list endpoints (orders, users, notifications) answer with
// {count, next, previous, results}; the rest still return a bare array.
// Callers only ever want the rows, so normalise both shapes here rather than
// teaching every page about pagination.
export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export default client;
