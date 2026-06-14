export const hasCookiesEnabled = (): boolean => {
  try {
    document.cookie = 'test=1';
    return document.cookie.includes('test');
  } catch {
    return false;
  }
};

export const clearAuthData = (): void => {
  sessionStorage.removeItem('taskflow_user');
  sessionStorage.removeItem('taskflow_isAuthenticated');
};

export const getStoredUser = (): { userId: string } | null => {
  try {
    const userStr = sessionStorage.getItem('taskflow_user');
    if (userStr) return JSON.parse(userStr);
    return null;
  } catch {
    return null;
  }
};

export const storeUser = (user: { userId: string }): void => {
  sessionStorage.setItem('taskflow_user', JSON.stringify(user));
  sessionStorage.setItem('taskflow_isAuthenticated', 'true');
};

export const setAuthenticated = (): void => {
  sessionStorage.setItem('taskflow_isAuthenticated', 'true');
};

export const isCookieAuthenticated = (): boolean => {
  return sessionStorage.getItem('taskflow_isAuthenticated') === 'true';
};
