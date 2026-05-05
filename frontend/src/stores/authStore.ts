import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthUser } from '../entities/Auth';

const FRONTPAGE_AUTH_STORAGE_KEY = 'auth-storage';
const GUEST_AUTH_STORAGE_KEY = 'tb-realms-guest-session';

interface FrontpageStoredUser {
  id?: string | number;
  username?: string | null;
  email?: string | null;
  role?: string;
  display_name?: string | null;
  is_guest?: boolean;
}

interface FrontpageStoredState {
  token?: string | null;
  user?: FrontpageStoredUser | null;
  isGuest?: boolean;
  loginUrl?: string | null;
}

interface FrontpageStoredAuth {
  state?: FrontpageStoredState;
}

export interface GuestSession {
  token: string;
  user: AuthUser;
}

interface AuthStoreState {
  guestSession: GuestSession | null;
  loginUrl: string | null;
  setGuestSession: (session: GuestSession) => void;
  clearGuestSession: () => void;
  setLoginUrl: (loginUrl: string) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    set => ({
      guestSession: null,
      loginUrl: null,
      setGuestSession: session => set({ guestSession: session }),
      clearGuestSession: () => set({ guestSession: null }),
      setLoginUrl: loginUrl => set({ loginUrl }),
    }),
    {
      name: GUEST_AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        guestSession: state.guestSession,
        loginUrl: state.loginUrl,
      }),
    }
  )
);

export function getFrontpageAuthToken(): string | null {
  const state = readFrontpageState();
  const token = state?.token;
  const isGuestToken = Boolean(state?.user?.is_guest || state?.isGuest);

  return typeof token === 'string' && token.trim() !== '' && !isGuestToken ? token : null;
}

export function getFrontpageUser(): FrontpageStoredUser | null {
  return readFrontpageState()?.user ?? null;
}

export function getGuestSession(): GuestSession | null {
  const session = useAuthStore.getState().guestSession;
  return session?.token && session.user?.id ? session : null;
}

export function getGuestAuthToken(): string | null {
  const session = getGuestSession();
  return session?.token ?? null;
}

export function getAuthToken(): string | null {
  return getFrontpageAuthToken() ?? getGuestAuthToken();
}

export function persistLoginUrl(loginUrl: string): void {
  useAuthStore.getState().setLoginUrl(loginUrl);
  window.dispatchEvent(new CustomEvent('webhatchery:login-required', { detail: { loginUrl } }));
}

export function hasMergeableGuestSession(): boolean {
  return Boolean(getFrontpageAuthToken() && getGuestAuthToken());
}

export function getAuthDisplayName(): string | null {
  const frontpageToken = getFrontpageAuthToken();
  if (frontpageToken) {
    const user = getFrontpageUser();
    return user?.display_name || user?.username || user?.email || null;
  }

  const guestUser = getGuestSession()?.user;
  return guestUser?.display_name || guestUser?.username || null;
}

function readFrontpageState(): FrontpageStoredState | null {
  try {
    const raw = localStorage.getItem(FRONTPAGE_AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as FrontpageStoredAuth;
    return parsed.state ?? null;
  } catch {
    return null;
  }
}
