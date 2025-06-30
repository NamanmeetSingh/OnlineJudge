"use client";

import { useState, useEffect, useContext, createContext } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      initializeAuth();
    }
  }, [mounted]);
  const initializeAuth = async () => {
    try {
      if (mounted && authApi.isAuthenticated()) {
        // For now, we'll just check if token exists
        // You can add token verification endpoint later
        const token = authApi.getToken();
        if (token) {
          try {
            const userData = await authApi.getProfile();
            setUser(userData.data?.user);
            setAuthenticated(true);
          } catch (error) {
            // If profile fetch fails, remove invalid token
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
            }
            setAuthenticated(false);
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authApi.register(userData);
      if (response.data?.success) {
        setUser(response.data.user);
        setAuthenticated(true);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      if (response.data?.success) {
        setUser(response.data.user);
        setAuthenticated(true);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setAuthenticated(false);
  };

  const handleAuthCallback = async (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      setAuthenticated(true);
      try {
        // Fetch user profile after setting token
        const userData = await authApi.getProfile();
        setUser(userData.data?.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authenticated,
    register,
    login,
    loginWithGoogle,
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
  if (context === undefined) {
    // During SSR or before AuthProvider is mounted, return a safe default
    if (typeof window === 'undefined') {
      return {
        user: null,
        loading: true,
        authenticated: false,
        register: () => Promise.resolve({ success: false, message: 'Auth not available' }),
        login: () => Promise.resolve({ success: false, message: 'Auth not available' }),
        loginWithGoogle: () => {},
        logout: () => Promise.resolve(),
        handleAuthCallback: () => {},
        refreshAuth: () => Promise.resolve()
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
