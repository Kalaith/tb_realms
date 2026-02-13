/**
 * UserSettings entity representing a user's visual and gameplay preferences
 */
export interface UserSettings {
  id: string;
  userId: string;
  theme: ThemeOption;
  language?: Language;
  realTimeUpdates: boolean;
  priceChangeIndicators: boolean;
  animationSpeed: AnimationSpeed;
  colorBlindMode: boolean;
  chartDetail: ChartDetailLevel;
  showGridLines: boolean;
  playerHighlighting: boolean;
  notificationPosition: NotificationPosition;
  soundEffects: boolean;
  focusMode: boolean;
  stockChangeThreshold: number;
  dataRefreshInterval?: number;
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
}

/**
 * Theme options for the application UI
 */
export type ThemeOption = "light" | "dark" | "system";

/**
 * Supported application languages
 */
export enum Language {
  ENGLISH = "en",
  SPANISH = "es",
  FRENCH = "fr",
  GERMAN = "de",
  JAPANESE = "ja",
}

/**
 * Animation speed options for UI elements
 */
export type AnimationSpeed = "off" | "slow" | "normal" | "fast";

/**
 * Chart detail level options
 */
export type ChartDetailLevel = "low" | "medium" | "high";

/**
 * Notification position options in the UI
 */
export type NotificationPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

/**
 * Notification settings for different alert types
 */
export interface NotificationSettings {
  marketAlerts: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  achievementAlerts: boolean;
}

/**
 * Privacy settings controlling what others can see
 */
export interface PrivacySettings {
  showProfilePublicly: boolean;
  showPortfolioPublicly: boolean;
  showAchievementsPublicly: boolean;
}

/**
 * Default user settings to use when no settings are found
 */
export const defaultUserSettings: Omit<UserSettings, "id" | "userId"> = {
  theme: "system",
  realTimeUpdates: true,
  priceChangeIndicators: true,
  animationSpeed: "normal",
  colorBlindMode: false,
  chartDetail: "medium",
  showGridLines: true,
  playerHighlighting: true,
  notificationPosition: "bottom-right",
  soundEffects: true,
  focusMode: false,
  stockChangeThreshold: 5,
  notifications: {
    marketAlerts: true,
    priceAlerts: true,
    newsAlerts: true,
    achievementAlerts: true,
  },
  privacy: {
    showProfilePublicly: true,
    showPortfolioPublicly: false,
    showAchievementsPublicly: true,
  },
};
