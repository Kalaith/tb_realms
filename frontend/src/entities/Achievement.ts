/**
 * Achievement entity and related types
 */

export type AchievementDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AchievementCategory = 'trading' | 'portfolio' | 'performance' | 'strategy';

export interface AchievementRequirement {
  type: string;
  threshold: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  points: number;
  requirement: AchievementRequirement;
}

export interface UserAchievement {
  achievementId: string;
  achievement: Achievement;
  unlocked: boolean;
  progress: number;
  progressPercentage: number; // 0-100
  unlockedAt?: Date;
}

export interface UserAchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  completionPercentage: number; // 0-100
  totalPoints: number;
  earnedPoints: number;
}
