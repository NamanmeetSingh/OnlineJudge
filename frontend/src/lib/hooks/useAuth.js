"use client";

import { useState, useEffect, useContext, createContext } from 'react';
import AuthService from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const isValid = await AuthService.verifyToken();
        
        if (isValid) {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
          setAuthenticated(true);
        } else {
          AuthService.removeToken();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    AuthService.loginWithGoogle();
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setAuthenticated(false);
  };

  const handleAuthCallback = (token) => {
    AuthService.setToken(token);
    initializeAuth();
  };

  const value = {
    user,
    loading,
    authenticated,
    login,
    logout,
    handleAuthCallback,
    refreshAuth: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
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
