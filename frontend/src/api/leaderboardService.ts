
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
    const response = await apiClient.get<
      { data?: LeaderboardUser[] } | LeaderboardUser[]
    >("leaderboard");
    return Array.isArray(response) ? response : (response.data ?? []);
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
    const response = await apiClient.get<
      { data?: LeaderboardUser } | LeaderboardUser
    >(`leaderboard/user/${userId}`);
    if (response && typeof response === "object" && "data" in response) {
      return response.data;
    }
    return response as LeaderboardUser;
  } catch (error) {
    console.error("Error fetching user ranking:", error);
    return undefined;
  }
};
