import { createContext } from 'react';
import type { AccountNavItem, AppBranding, NavigationItem } from '../entities/navigation';

export interface NavigationContextType {
  mainNavigation: NavigationItem[];
  accountNavigation: AccountNavItem[];
  appBranding: AppBranding;
  isLoading: boolean;
  error: string | null;
  refreshNavigationData: () => Promise<void>;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);
