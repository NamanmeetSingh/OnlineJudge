import React, { useState, useEffect } from 'react';
import { TrophyIcon, StarIcon, FireIcon } from '@heroicons/react/24/outline';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      
      // Mock leaderboard data
      const mockLeaderboard = [
        {
          rank: 1,
          username: "algorithm_master",
          rating: 2847,
          problemsSolved: 1247,
          contestsWon: 23,
          country: "USA",
          avatar: "https://ui-avatars.com/api/?name=algorithm_master&background=random"
        },
        {
          rank: 2,
          username: "code_ninja",
          rating: 2756,
          problemsSolved: 1156,
          contestsWon: 18,
          country: "India",
          avatar: "https://ui-avatars.com/api/?name=code_ninja&background=random"
        },
        {
          rank: 3,
          username: "binary_wizard",
          rating: 2689,
          problemsSolved: 987,
          contestsWon: 15,
          country: "China",
          avatar: "https://ui-avatars.com/api/?name=binary_wizard&background=random"
        },
        {
          rank: 4,
          username: "dp_specialist",
          rating: 2634,
          problemsSolved: 876,
          contestsWon: 12,
          country: "Russia",
          avatar: "https://ui-avatars.com/api/?name=dp_specialist&background=random"
        },
        {
          rank: 5,
          username: "graph_explorer",
          rating: 2578,
          problemsSolved: 756,
          contestsWon: 9,
          country: "Japan",
          avatar: "https://ui-avatars.com/api/?name=graph_explorer&background=random"
        },
        {
          rank: 6,
          username: "tree_traverser",
          rating: 2523,
          problemsSolved: 687,
          contestsWon: 7,
          country: "Germany",
          avatar: "https://ui-avatars.com/api/?name=tree_traverser&background=random"
        },
        {
          rank: 7,
          username: "sort_master",
          rating: 2456,
          problemsSolved: 623,
          contestsWon: 6,
          country: "Canada",
          avatar: "https://ui-avatars.com/api/?name=sort_master&background=random"
        },
        {
          rank: 8,
          username: "regex_guru",
          rating: 2398,
          problemsSolved: 567,
          contestsWon: 4,
          country: "Brazil",
          avatar: "https://ui-avatars.com/api/?name=regex_guru&background=random"
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [selectedPeriod]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      return <TrophyIcon className={`h-6 w-6 ${getRankColor(rank)}`} />;
    }
    return <span className={`font-bold text-lg ${getRankColor(rank)}`}>#{rank}</span>;
  };

  const getRatingColor = (rating) => {
    if (rating >= 2500) return 'text-red-500 font-bold';
    if (rating >= 2000) return 'text-orange-500 font-semibold';
    if (rating >= 1500) return 'text-blue-500 font-medium';
    if (rating >= 1000) return 'text-green-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top competitive programmers worldwide
          </p>
        </div>

        {/* Filter Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="year">This Year</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Top Performers
          </h2>
          <div className="flex justify-center items-end space-x-8">
            {/* Second Place */}
            {leaderboard[1] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-20 bg-gray-300 dark:bg-gray-600 rounded-t-lg flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-sm">#2</span>
                </div>
                <img
                  src={leaderboard[1].avatar}
                  alt={leaderboard[1].username}
                  className="w-16 h-16 rounded-full border-4 border-gray-400 -mt-2"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white mt-2">
                  {leaderboard[1].username}
                </h3>
                <p className={`text-sm ${getRatingColor(leaderboard[1].rating)}`}>
                  {leaderboard[1].rating}
                </p>
              </div>
            )}

            {/* First Place */}
            {leaderboard[0] && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-24 bg-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                  <TrophyIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <img
                  src={leaderboard[0].avatar}
                  alt={leaderboard[0].username}
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 -mt-2"
                />
                <h3 className="font-bold text-gray-900 dark:text-white mt-2 text-lg">
                  {leaderboard[0].username}
                </h3>
                <p className={`text-sm ${getRatingColor(leaderboard[0].rating)}`}>
                  {leaderboard[0].rating}
                </p>
              </div>
            )}

            {/* Third Place */}
            {leaderboard[2] && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-600 rounded-t-lg flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-sm">#3</span>
                </div>
                <img
                  src={leaderboard[2].avatar}
                  alt={leaderboard[2].username}
                  className="w-16 h-16 rounded-full border-4 border-amber-600 -mt-2"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white mt-2">
                  {leaderboard[2].username}
                </h3>
                <p className={`text-sm ${getRatingColor(leaderboard[2].rating)}`}>
                  {leaderboard[2].rating}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Problems Solved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contests Won
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Country
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((user) => (
                  <tr
                    key={user.rank}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar}
                          alt={user.username}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${getRatingColor(user.rating)}`}>
                        {user.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        {user.problemsSolved}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <FireIcon className="h-4 w-4 text-red-400 mr-1" />
                        {user.contestsWon}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {user.country}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Rating
                </h3>
                <p className="text-2xl font-bold text-yellow-500">
                  {leaderboard[0]?.rating || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Most Problems Solved
                </h3>
                <p className="text-2xl font-bold text-blue-500">
                  {leaderboard[0]?.problemsSolved || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <FireIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Most Contests Won
                </h3>
                <p className="text-2xl font-bold text-red-500">
                  {leaderboard[0]?.contestsWon || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
