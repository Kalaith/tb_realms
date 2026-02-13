/**
 * Interface definitions for the Settings UI components
 */

/**
 * Possible setting value types
 */
export type SettingValueType =
  | boolean
  | string
  | number
  | string[]
  | Record<string, unknown>;

/**
 * Represents a single configurable setting in the UI
 */
export interface VisualSetting {
  id: string;
  label: string;
  description?: string;
  type: "toggle" | "select" | "color" | "slider";
  options?: Array<{ value: string; label: string }>;
  defaultValue: SettingValueType;
}

/**
 * Represents a group of related settings
 */
export interface SettingsCategory {
  id: string;
  title: string;
  description?: string;
  settings: VisualSetting[];
}
