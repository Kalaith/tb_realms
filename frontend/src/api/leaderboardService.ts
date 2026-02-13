import apiClient from "./apiClient";

export interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  portfolioValue: number;
  portfolioGrowth: number;
  rank: number;
  badges: string[];
  winStreak: number;
  bestTrade: {
    stockName: string;
    percentageGain: number;
    date: string;
  };
}

/**
 * Get leaderboard data from the API
 */
export const fetchLeaderboardData = async (): Promise<LeaderboardUser[]> => {
  try {
    const response = await apiClient.get("leaderboard");
    return response.data || response;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
};

/**
 * Get a specific user's ranking from the API
 */
export const fetchUserRanking = async (
  userId: string,
): Promise<LeaderboardUser | undefined> => {
  try {
    const response = await apiClient.get(`leaderboard/user/${userId}`);
    return response.data || response;
  } catch (error) {
    console.error("Error fetching user ranking:", error);
    return undefined;
  }
};
