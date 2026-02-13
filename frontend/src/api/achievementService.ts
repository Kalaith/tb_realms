import { BaseApiService } from "./baseApiService";
import {
  Achievement,
  UserAchievement,
  UserAchievementStats,
} from "../entities/Achievement";
import { ApiResponse } from "../entities/api";
import apiClient from "./apiClient";
import { toApiError } from "./apiErrorUtils";
import { unwrapData } from "./apiResponseUtils";

/**
 * Service for managing achievements data
 */
export class AchievementService extends BaseApiService<Achievement> {
  constructor() {
    super("achievements");
  }

  /**
   * Convert achievement data to proper Achievement type with date objects
   */
  private normalizeUserAchievementData(
    achievement: UserAchievement,
  ): UserAchievement {
    return {
      ...achievement,
      unlockedAt: achievement.unlockedAt
        ? new Date(achievement.unlockedAt)
        : undefined,
    };
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<ApiResponse<Achievement[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(this.endpoint);
      return {
        success: true,
        data: unwrapData<Achievement[]>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to fetch achievements");
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Get user's achievements with progress
   */
  async getUserAchievements(
    userId: string,
  ): Promise<ApiResponse<UserAchievement[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(
        `${this.endpoint}/user/${userId}`,
      );
      const achievements = unwrapData<unknown[]>(response);

      // Normalize the achievement data with proper date objects
      const normalizedAchievements = achievements.map((achievement) =>
        this.normalizeUserAchievementData(achievement as UserAchievement),
      );

      return {
        success: true,
        data: normalizedAchievements,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to fetch user achievements");
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Get user's achievement stats
   */
  async getUserAchievementStats(
    userId: string,
  ): Promise<ApiResponse<UserAchievementStats>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(
        `${this.endpoint}/user/${userId}/stats`,
      );
      return {
        success: true,
        data: unwrapData<UserAchievementStats>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to fetch achievement stats");
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(
    userId: string,
    category: string,
  ): Promise<ApiResponse<UserAchievement[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(
        `${this.endpoint}/user/${userId}/category/${category}`,
      );
      const achievements = unwrapData<unknown[]>(response);

      // Normalize the achievement data with proper date objects
      const normalizedAchievements = achievements.map((achievement) =>
        this.normalizeUserAchievementData(achievement as UserAchievement),
      );

      return {
        success: true,
        data: normalizedAchievements,
      };
    } catch (error: unknown) {
      const apiError = toApiError(
        error,
        "Failed to fetch achievements by category",
      );
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Get achievement by ID
   */
  async getAchievementById(
    userId: string,
    achievementId: string,
  ): Promise<ApiResponse<UserAchievement>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(
        `${this.endpoint}/user/${userId}/${achievementId}`,
      );
      const achievement = unwrapData<unknown>(response);

      return {
        success: true,
        data: this.normalizeUserAchievementData(achievement as UserAchievement),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to fetch achievement");
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }
}

// Create and export singleton instance
export const achievementService = new AchievementService();
