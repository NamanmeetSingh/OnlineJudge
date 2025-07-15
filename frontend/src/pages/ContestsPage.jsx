import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  UsersIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ContestsPage = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const mockContests = {
      upcoming: [
        {
          id: 1,
          title: "Weekly Contest 125",
          description: "Weekly competitive programming contest with 4 algorithmic problems",
          startTime: "2024-01-20T14:00:00Z",
          duration: 90,
          participants: 2847,
          difficulty: "Mixed",
          prizes: ["$500", "$200", "$100"],
          isRegistered: false
        },
        {
          id: 2,
          title: "Algorithms Bootcamp Challenge",
          description: "Advanced algorithms challenge focusing on dynamic programming and graphs",
          startTime: "2024-01-22T16:30:00Z",
          duration: 120,
          participants: 1256,
          difficulty: "Hard",
          prizes: ["$1000", "$500", "$250"],
          isRegistered: true
        }
      ],
      live: [
        {
          id: 3,
          title: "Daily Challenge Round",
          description: "Quick 30-minute problem solving session",
          startTime: "2024-01-15T10:00:00Z",
          duration: 30,
          participants: 892,
          difficulty: "Easy",
          prizes: ["Badge", "Points"],
          timeLeft: "15:42",
          isParticipating: false
        }
      ],
      past: [
        {
          id: 4,
          title: "Data Structures Mastery",
          description: "Contest focused on advanced data structure implementations",
          startTime: "2024-01-10T15:00:00Z",
          duration: 180,
          participants: 3421,
          difficulty: "Hard",
          prizes: ["$800", "$400", "$200"],
          myRank: 127,
          totalParticipants: 3421,
          score: 2847
        },
        {
          id: 5,
          title: "Beginner's Cup",
          description: "Contest designed for newcomers to competitive programming",
          startTime: "2024-01-08T12:00:00Z",
          duration: 120,
          participants: 1876,
          difficulty: "Easy",
          prizes: ["Certificate", "Badge"],
          myRank: 45,
          totalParticipants: 1876,
          score: 3156
        }
      ]
    };

    setContests(mockContests);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const handleRegister = (contestId) => {
    setContests(prev => ({
      ...prev,
      upcoming: prev.upcoming.map(contest =>
        contest.id === contestId
          ? { ...contest, isRegistered: !contest.isRegistered }
          : contest
      )
    }));
  };

  const handleParticipate = (contestId) => {
    setContests(prev => ({
      ...prev,
      live: prev.live.map(contest =>
        contest.id === contestId
          ? { ...contest, isParticipating: !contest.isParticipating }
          : contest
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Contests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Participate in competitive programming contests and challenge yourself
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'upcoming', label: 'Upcoming', count: contests.upcoming?.length || 0 },
              { key: 'live', label: 'Live', count: contests.live?.length || 0 },
              { key: 'past', label: 'Past', count: contests.past?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="capitalize">{tab.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contest List */}
        <div className="space-y-6">
          {contests[activeTab]?.map((contest) => (
            <div
              key={contest.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {contest.title}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(contest.difficulty)}`}>
                      {contest.difficulty}
                    </span>
                    {activeTab === 'live' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {contest.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(contest.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {activeTab === 'live' ? `${contest.timeLeft} left` : `${contest.duration} minutes`}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <UsersIcon className="h-4 w-4" />
                      <span>{contest.participants.toLocaleString()} participants</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <TrophyIcon className="h-4 w-4" />
                      <span>Prizes: {contest.prizes.join(', ')}</span>
                    </div>
                  </div>

                  {activeTab === 'past' && contest.myRank && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">My Rank:</span>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            #{contest.myRank} / {contest.totalParticipants}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Score:</span>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {contest.score}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Percentile:</span>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {Math.round((1 - contest.myRank / contest.totalParticipants) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                  {activeTab === 'upcoming' && (
                    <>
                      {user ? (
                        <button
                          onClick={() => handleRegister(contest.id)}
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            contest.isRegistered
                              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {contest.isRegistered ? 'Registered ✓' : 'Register'}
                        </button>
                      ) : (
                        <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed">
                          Login to Register
                        </button>
                      )}
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <EyeIcon className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </>
                  )}
                  
                  {activeTab === 'live' && (
                    <>
                      {user ? (
                        <button
                          onClick={() => handleParticipate(contest.id)}
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                            contest.isParticipating
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <PlayIcon className="h-4 w-4" />
                          <span>{contest.isParticipating ? 'Continue' : 'Participate'}</span>
                        </button>
                      ) : (
                        <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed">
                          Login to Participate
                        </button>
                      )}
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <EyeIcon className="h-4 w-4" />
                        <span>View Leaderboard</span>
                      </button>
                    </>
                  )}
                  
                  {activeTab === 'past' && (
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <EyeIcon className="h-4 w-4" />
                        <span>View Solutions</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <TrophyIcon className="h-4 w-4" />
                        <span>Final Standings</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {contests[activeTab]?.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No {activeTab} contests
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'upcoming' && "Check back later for new contests!"}
              {activeTab === 'live' && "No contests are currently running."}
              {activeTab === 'past' && "You haven't participated in any contests yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestsPage;
