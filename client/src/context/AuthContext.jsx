import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res?.data?.user) {
        setUser(res.data.user);
        setGoogleConfigured(Boolean(res.data.googleConfigured));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        googleConfigured,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
