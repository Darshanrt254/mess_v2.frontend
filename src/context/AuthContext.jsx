import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check current session from backend on app boot
  const checkAuth = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or network error -> treat as unauthenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for 401 events from api client to reset session without redirect loops
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [checkAuth]);

  /**
   * Real Backend Login
   * Sends credentials to POST /api/auth/login.
   * Role is authoritative from backend (OWNER or CUSTOMER).
   */
  const login = useCallback(async ({ loginIdentifier, identifier, password }) => {
    setIsLoading(true);
    try {
      const payload = {
        loginIdentifier: loginIdentifier || identifier,
        password,
      };

      const data = await api.post('/auth/login', payload);
      const authenticatedUser = data.user;

      setUser(authenticatedUser);
      return { user: authenticatedUser, role: authenticatedUser.role };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Real Backend Logout
   * Revokes server-side session and clears HttpOnly cookie.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout network errors
    } finally {
      setUser(null);
    }
  }, []);

  /**
   * Refreshes the user profile data from /api/auth/me
   */
  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      if (data?.user) {
        setUser(data.user);
        return data.user;
      }
    } catch {
      // ignore
    }
    return null;
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
