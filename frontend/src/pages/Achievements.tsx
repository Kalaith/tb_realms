import React, { useState, useEffect } from "react";
import { achievementService } from "../api/achievementService";
import { UserAchievement, UserAchievementStats } from "../entities/Achievement";
import AchievementIcon from "../components/achievements/AchievementIcon";
import { formatDate } from "../utils/formatUtils";
import { LoadingSpinner } from "../components/utility";

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<UserAchievementStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Mock user ID - consistent with portfolio service
  const userId = "elf782";

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's achievements data
        const achievementsResponse =
          await achievementService.getUserAchievements(userId);
        const statsResponse =
          await achievementService.getUserAchievementStats(userId);

        if (achievementsResponse.success && achievementsResponse.data) {
          setAchievements(achievementsResponse.data);
        } else {
          setError("Failed to load achievements data");
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (err) {
        setError("An error occurred while fetching achievements data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  // Filter achievements based on selected filter
  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "all") return true;
    if (filter === "unlocked") return achievement.unlocked;
    if (filter === "locked") return !achievement.unlocked;
    return achievement.achievement.category === filter;
  });

  // Get unique categories for filter buttons
  const categories = [
    ...new Set(achievements.map((a) => a.achievement.category)),
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your progress and earn badges as you master stock trading
          </p>
        </div>

        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your progress and earn badges as you master stock trading
          </p>
        </div>

        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your progress and earn badges as you master stock trading
        </p>
      </div>

      {/* Achievement Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Achievements Unlocked
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.unlockedAchievements} / {stats.totalAchievements}
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Completion
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.completionPercentage}%
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Points Earned
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.earnedPoints} / {stats.totalPoints}
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "all"
              ? "bg-blue-600 text-white dark:bg-blue-700"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "unlocked"
              ? "bg-blue-600 text-white dark:bg-blue-700"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          onClick={() => setFilter("unlocked")}
        >
          Unlocked
        </button>

        <button
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "locked"
              ? "bg-blue-600 text-white dark:bg-blue-700"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
          onClick={() => setFilter("locked")}
        >
          Locked
        </button>

        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === category
                ? "bg-blue-600 text-white dark:bg-blue-700"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.achievementId}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${
              achievement.unlocked
                ? "border-2 border-green-500 dark:border-green-600"
                : "border border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div
                  className={`${achievement.unlocked ? "text-green-500 dark:text-green-400" : "text-gray-400 dark:text-gray-500"} mr-3`}
                >
                  <AchievementIcon
                    icon={achievement.achievement.icon}
                    unlocked={achievement.unlocked}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {achievement.achievement.category}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {achievement.achievement.title}
                  </h3>
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                {achievement.achievement.description}
              </p>

              <div className="flex justify-between items-center mb-3">
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                    achievement.achievement.difficulty === "beginner"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : achievement.achievement.difficulty === "intermediate"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {achievement.achievement.difficulty.charAt(0).toUpperCase() +
                    achievement.achievement.difficulty.slice(1)}
                </span>

                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {achievement.achievement.points} points
                </span>
              </div>

              {achievement.unlocked && achievement.unlockedAt && (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center py-2 bg-gray-50 dark:bg-gray-700 rounded">
                  Unlocked on {formatDate(achievement.unlockedAt)}
                </div>
              )}

              {!achievement.unlocked && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1 text-xs text-gray-600 dark:text-gray-300">
                    <span>Progress</span>
                    <span>
                      {achievement.progress} /{" "}
                      {achievement.achievement.requirement.threshold}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full dark:bg-blue-500"
                      style={{ width: `${achievement.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          No achievements found for the selected filter.
        </div>
      )}
    </div>
  );
};

export default Achievements;
