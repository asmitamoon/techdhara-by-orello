let _token = null;

export const setToken = (token) => { _token = token; };
export const getToken = () => _token;
export const clearToken = () => { _token = null; };

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Date.now() >= (payload.exp * 1000) - 30_000; // 30s buffer
  } catch {
    return true;
  }
};
