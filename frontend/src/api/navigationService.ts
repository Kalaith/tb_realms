/**
 * Navigation API Service for frontend
 */
import { ApiResponse } from "../entities/api";
import { NavigationItem, AccountNavItem } from "../entities/navigation";
import apiClient from "./apiClient";

interface AppBranding {
  name: string;
  logoUrl: string | null;
  version: string;
}

class NavigationService {
  /**
   * Fetch main navigation items from the API
   */
  async getMainNavigation(): Promise<ApiResponse<NavigationItem[]>> {
    try {
      return await apiClient.get("navigation");
    } catch (error) {
      console.error("Error fetching navigation items:", error);
      throw error;
    }
  }

  /**
   * Fetch account navigation items from the API
   */
  async getAccountNavigation(): Promise<ApiResponse<AccountNavItem[]>> {
    try {
      return await apiClient.get("navigation/account");
    } catch (error) {
      console.error("Error fetching account navigation items:", error);
      throw error;
    }
  }

  /**
   * Fetch application branding from the API
   */
  async getAppBranding(): Promise<ApiResponse<AppBranding>> {
    try {
      return await apiClient.get("navigation/branding");
    } catch (error) {
      console.error("Error fetching app branding:", error);
      throw error;
    }
  }
}

export default new NavigationService();
