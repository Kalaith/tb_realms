import apiClient from './apiClient';

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
    const response = await apiClient.get<{ data?: LeaderboardUser[] } | LeaderboardUser[]>(
      'leaderboard'
    );
    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.data ?? [];
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return [];
  }
};

/**
 * Get a specific user's ranking from the API
 */
export const fetchUserRanking = async (userId: string): Promise<LeaderboardUser | undefined> => {
  try {
    const response = await apiClient.get<{ data?: LeaderboardUser } | LeaderboardUser>(
      `leaderboard/user/${userId}`
    );
    const payload = response.data;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as { data?: LeaderboardUser }).data;
    }
    return payload as LeaderboardUser;
  } catch (error) {
    console.error('Error fetching user ranking:', error);
    return undefined;
  }
};
