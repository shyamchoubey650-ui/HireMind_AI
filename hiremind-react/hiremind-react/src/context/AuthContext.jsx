import { createContext, useContext, useState, useCallback } from 'react';
import { getUser, getToken, setUser as persistUser, setToken as persistToken, clearAuth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser());
  const [token, setTokenState] = useState(() => getToken());

  const login = useCallback((userObj, tokenStr) => {
    persistUser(userObj);
    persistToken(tokenStr);
    setUserState(userObj);
    setTokenState(tokenStr);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
