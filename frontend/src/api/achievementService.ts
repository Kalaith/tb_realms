import { BaseApiService } from './baseApiService';
import { Achievement, UserAchievement, UserAchievementStats } from '../entities/Achievement';
import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';

/**
 * Service for managing achievements data
 */
export class AchievementService extends BaseApiService<Achievement> {
  constructor() {
    super('achievements');
  }

  /**
   * Convert achievement data to proper Achievement type with date objects
   */
  private normalizeUserAchievementData(achievement: any): UserAchievement {
    return {
      ...achievement,
      unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
    };
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<ApiResponse<Achievement[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(this.endpoint);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch achievements',
        },
      };
    }
  }

  /**
   * Get user's achievements with progress
   */
  async getUserAchievements(userId: string): Promise<ApiResponse<UserAchievement[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(`${this.endpoint}/user/${userId}`);
      const achievements = response.data || response;
      
      // Normalize the achievement data with proper date objects
      const normalizedAchievements = achievements.map((achievement: any) => 
        this.normalizeUserAchievementData(achievement)
      );
      
      return {
        success: true,
        data: normalizedAchievements
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch user achievements',
        },
      };
    }
  }

  /**
   * Get user's achievement stats
   */
  async getUserAchievementStats(userId: string): Promise<ApiResponse<UserAchievementStats>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(`${this.endpoint}/user/${userId}/stats`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch achievement stats',
        },
      };
    }
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(userId: string, category: string): Promise<ApiResponse<UserAchievement[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(`${this.endpoint}/user/${userId}/category/${category}`);
      const achievements = response.data || response;
      
      // Normalize the achievement data with proper date objects
      const normalizedAchievements = achievements.map((achievement: any) => 
        this.normalizeUserAchievementData(achievement)
      );
      
      return {
        success: true,
        data: normalizedAchievements
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch achievements by category',
        },
      };
    }
  }

  /**
   * Get achievement by ID
   */
  async getAchievementById(userId: string, achievementId: string): Promise<ApiResponse<UserAchievement>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(`${this.endpoint}/user/${userId}/${achievementId}`);
      const achievement = response.data || response;
      
      return {
        success: true,
        data: this.normalizeUserAchievementData(achievement)
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch achievement',
        },
      };
    }
  }
}

// Create and export singleton instance
export const achievementService = new AchievementService();