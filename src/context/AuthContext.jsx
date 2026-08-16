import React, { createContext, useContext, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'posfe_auth';

const initialAuthState = {
  token: null,
  userId: null,
  userName: '',
  userEmail: '',
  userRole: '',
  isAuthenticated: false,
};

const AuthContext = createContext({
  ...initialAuthState,
  login: () => {},
  logout: () => {},
});

const getStoredAuth = () => {
  try {
    const storedValue = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = storedValue ? JSON.parse(storedValue) : null;

    if (!parsed?.token || typeof parsed.token !== 'string' || !parsed.token.trim()) {
      return initialAuthState;
    }

    return {
      ...initialAuthState,
      ...parsed,
      isAuthenticated: true,
    };
  } catch (error) {
    return initialAuthState;
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getStoredAuth);

  const login = ({ token, userId, userName, userEmail, userRole }) => {
    const nextState = {
      token,
      userId,
      userName,
      userEmail,
      userRole,
      isAuthenticated: true,
    };

    setAuthState(nextState);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
  };

  const logout = () => {
    setAuthState(initialAuthState);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const contextValue = useMemo(
    () => ({ ...authState, login, logout }),
    [authState]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
