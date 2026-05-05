import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/apiClient';
import type { AuthUser } from '../entities/Auth';
import { UserContext, type UserContextType } from './authContextValue';
import {
  getAuthToken,
  getFrontpageAuthToken,
  getFrontpageUser,
  getGuestAuthToken,
  getGuestSession,
  hasMergeableGuestSession,
  persistLoginUrl,
  useAuthStore,
} from '../stores/authStore';

interface UserProviderProps {
  children: React.ReactNode;
}

interface AuthApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');
const webHatcheryLoginUrl = normalizeBaseUrl(import.meta.env.VITE_WEB_HATCHERY_LOGIN_URL);

if (!webHatcheryLoginUrl) {
  throw new Error('VITE_WEB_HATCHERY_LOGIN_URL environment variable is required');
}

const withReturnTo = (loginUrl: string): string => {
  const url = new URL(loginUrl, window.location.origin);
  url.searchParams.set('return_to', window.location.href);
  return url.toString();
};

export const AuthProvider: React.FC<UserProviderProps> = ({ children }) => {
  const guestSession = useAuthStore(state => state.guestSession);
  const setGuestSession = useAuthStore(state => state.setGuestSession);
  const clearGuestSession = useAuthStore(state => state.clearGuestSession);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'frontpage' | 'guest' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loginUrl = useMemo(() => withReturnTo(webHatcheryLoginUrl), []);

  const syncFromTokenSources = useCallback((): void => {
    const frontpageToken = getFrontpageAuthToken();
    if (frontpageToken) {
      setAuthMode('frontpage');
      return;
    }

    const guest = getGuestSession();
    if (guest) {
      setAuthMode('guest');
      setUser(guest.user);
      return;
    }

    setAuthMode(null);
    setUser(null);
  }, []);

  const requestLogin = useCallback((): void => {
    setError(null);
    persistLoginUrl(loginUrl);
  }, [loginUrl]);

  const getLinkAccountUrl = useCallback((): string => loginUrl, [loginUrl]);

  const refreshUser = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setAuthMode(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<AuthApiResponse<{ user: AuthUser }>>('/auth/session');
      const authUser = response.data.data?.user;
      if (!response.data.success || !authUser) {
        throw new Error(response.data.message || response.data.error || 'Authentication check failed');
      }

      const frontpageUser = getFrontpageAuthToken() ? getFrontpageUser() : null;
      const isGuest = Boolean(authUser.is_guest || getGuestAuthToken());
      setAuthMode(isGuest ? 'guest' : 'frontpage');
      setUser({
        ...authUser,
        id: String(authUser.id),
        username: frontpageUser?.username || authUser.username,
        email: frontpageUser?.email || authUser.email,
        role: isGuest ? 'guest' : frontpageUser?.role || authUser.role || 'player',
        display_name: frontpageUser?.display_name || authUser.display_name,
        is_guest: isGuest,
        auth_type: isGuest ? 'guest' : 'frontpage',
      });
    } catch (err) {
      if (getGuestAuthToken()) {
        clearGuestSession();
      }
      setUser(null);
      setAuthMode(null);
      setError(err instanceof Error ? err.message : 'Failed to validate session');
    } finally {
      setIsLoading(false);
    }
  }, [clearGuestSession]);

  const continueAsGuest = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const existingSession = getGuestSession();
      if (existingSession) {
        setAuthMode('guest');
        setUser(existingSession.user);
        return;
      }

      const response = await apiClient.post<AuthApiResponse<{ token: string; user: AuthUser }>>(
        '/auth/guest-session',
        {}
      );
      const payload = response.data.data;
      if (!response.data.success || !payload?.token || !payload.user) {
        throw new Error(response.data.message || response.data.error || 'Failed to create guest session');
      }

      const nextGuestSession = {
        token: payload.token,
        user: {
          ...payload.user,
          id: String(payload.user.id),
          is_guest: true,
          auth_type: 'guest' as const,
        },
      };

      setGuestSession(nextGuestSession);
      setAuthMode('guest');
      setUser(nextGuestSession.user);
    } catch (err) {
      clearGuestSession();
      setAuthMode(null);
      setUser(null);
      setError(err instanceof Error ? err.message : 'Failed to create guest session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearGuestSession, setGuestSession]);

  const mergeGuestSession = useCallback(async (): Promise<void> => {
    const guestToken = getGuestAuthToken();
    if (!getFrontpageAuthToken() || !guestToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<AuthApiResponse<unknown>>('/auth/link-guest', {
        guest_token: guestToken,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || response.data.error || 'Failed to link guest progress');
      }

      clearGuestSession();
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link guest progress');
    } finally {
      setIsLoading(false);
    }
  }, [clearGuestSession, refreshUser]);

  const logout = useCallback((): void => {
    if (authMode === 'guest') {
      clearGuestSession();
      setAuthMode(null);
      setUser(null);
      setError(null);
      return;
    }

    persistLoginUrl(loginUrl);
    setUser(null);
    setAuthMode(null);
  }, [authMode, clearGuestSession, loginUrl]);

  useEffect(() => {
    syncFromTokenSources();
    void refreshUser();
  }, [guestSession, refreshUser, syncFromTokenSources]);

  const contextValue: UserContextType = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getAuthToken()),
      isLoading,
      error,
      authMode,
      loginUrl,
      canMergeGuestSession: hasMergeableGuestSession(),
      logout,
      requestLogin,
      continueAsGuest,
      mergeGuestSession,
      getLinkAccountUrl,
      refreshUser,
    }),
    [
      authMode,
      continueAsGuest,
      error,
      getLinkAccountUrl,
      isLoading,
      loginUrl,
      requestLogin,
      logout,
      mergeGuestSession,
      refreshUser,
      user,
    ]
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
