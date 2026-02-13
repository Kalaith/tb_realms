import { UserSettings } from "./UserSettings";

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  joinedDate: Date;
  achievements: UserAchievement[];
  settings: UserSettings;
}

/**
 * Simplified Achievement for user profile display
 * References the full Achievement from Achievement.ts
 */
export interface UserAchievement {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  acquired: boolean;
  acquiredDate?: Date;
  progress?: number; // 0-100 percentage
  requiredValue?: number;
}
