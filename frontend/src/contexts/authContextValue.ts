import { createContext } from 'react';
import type { AuthUser } from '../entities/Auth';

export interface UserContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authMode: 'frontpage' | 'guest' | null;
  loginUrl: string;
  canMergeGuestSession: boolean;
  logout: () => void;
  requestLogin: () => void;
  continueAsGuest: () => Promise<void>;
  mergeGuestSession: () => Promise<void>;
  getLinkAccountUrl: () => string;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
