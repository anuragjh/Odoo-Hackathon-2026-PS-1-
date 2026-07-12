import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { getAccessToken, getStoredUser, clearSession } from '../services/tokenStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!getAccessToken()) {
        if (active) {
          setUser(null);
          setInitializing(false);
        }
        return;
      }
      try {
        const me = await authService.fetchCurrentUser();
        if (active) setUser(me);
      } catch {
        clearSession();
        if (active) setUser(null);
      } finally {
        if (active) setInitializing(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authService.fetchCurrentUser();
    setUser(me);
    return me;
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    initializing,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export { AuthContext };
