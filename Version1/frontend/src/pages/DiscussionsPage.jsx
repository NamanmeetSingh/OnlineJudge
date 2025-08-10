import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const DiscussionsPage = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    const mockDiscussions = [
      {
        id: 1,
        title: "Best approach for solving Two Sum problem?",
        content: "I've been trying different approaches for the Two Sum problem. What do you think is the most efficient way?",
        author: {
          name: "code_enthusiast",
          avatar: "https://ui-avatars.com/api/?name=code_enthusiast&background=random",
          rating: 1456
        },
        category: "algorithms",
        tags: ["arrays", "hash-table", "two-sum"],
        likes: 23,
        replies: 8,
        createdAt: "2024-01-15T10:30:00Z",
        isLiked: false,
        isPinned: false,
        lastActivity: "2024-01-15T14:22:00Z"
      },
      {
        id: 2,
        title: "Dynamic Programming: When to use memoization vs tabulation?",
        content: "I'm confused about when to use top-down vs bottom-up approaches in DP. Can someone explain with examples?",
        author: {
          name: "dp_learner",
          avatar: "https://ui-avatars.com/api/?name=dp_learner&background=random",
          rating: 1789
        },
        category: "algorithms",
        tags: ["dynamic-programming", "memoization", "tabulation"],
        likes: 45,
        replies: 15,
        createdAt: "2024-01-14T16:45:00Z",
        isLiked: true,
        isPinned: true,
        lastActivity: "2024-01-15T12:18:00Z"
      },
      {
        id: 3,
        title: "Contest Strategy: Time management tips",
        content: "I always run out of time during contests. What are your strategies for managing time effectively?",
        author: {
          name: "contest_rookie",
          avatar: "https://ui-avatars.com/api/?name=contest_rookie&background=random",
          rating: 1234
        },
        category: "contests",
        tags: ["strategy", "time-management", "contests"],
        likes: 31,
        replies: 12,
        createdAt: "2024-01-14T09:15:00Z",
        isLiked: false,
        isPinned: false,
        lastActivity: "2024-01-15T11:45:00Z"
      },
      {
        id: 4,
        title: "Graph algorithms: BFS vs DFS implementation",
        content: "What are the key differences in implementing BFS and DFS? When should I choose one over the other?",
        author: {
          name: "graph_explorer",
          avatar: "https://ui-avatars.com/api/?name=graph_explorer&background=random",
          rating: 2156
        },
        category: "algorithms",
        tags: ["graphs", "bfs", "dfs", "traversal"],
        likes: 67,
        replies: 22,
        createdAt: "2024-01-13T14:20:00Z",
        isLiked: true,
        isPinned: false,
        lastActivity: "2024-01-15T13:30:00Z"
      },
      {
        id: 5,
        title: "Debugging techniques for competitive programming",
        content: "Share your favorite debugging techniques and tools for competitive programming problems.",
        author: {
          name: "debug_master",
          avatar: "https://ui-avatars.com/api/?name=debug_master&background=random",
          rating: 1987
        },
        category: "general",
        tags: ["debugging", "tips", "tools"],
        likes: 38,
        replies: 9,
        createdAt: "2024-01-13T11:30:00Z",
        isLiked: false,
        isPinned: false,
        lastActivity: "2024-01-15T10:15:00Z"
      }
    ];

    setDiscussions(mockDiscussions);
  }, []);

  const handleLike = (discussionId) => {
    setDiscussions(discussions.map(discussion => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          isLiked: !discussion.isLiked,
          likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1
        };
      }
      return discussion;
    }));
  };

  const handleCreateDiscussion = () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      return;
    }

    const discussion = {
      id: Date.now(),
      title: newDiscussion.title,
      content: newDiscussion.content,
      author: {
        name: user?.name || 'Anonymous',
        avatar: user?.avatar || 'https://ui-avatars.com/api/?name=Anonymous&background=random',
        rating: user?.rating || 1200
      },
      category: newDiscussion.category,
      tags: [],
      likes: 0,
      replies: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
      isPinned: false,
      lastActivity: new Date().toISOString()
    };

    setDiscussions([discussion, ...discussions]);
    setNewDiscussion({ title: '', content: '', category: 'general' });
    setShowCreateModal(false);
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes;
      case 'replies':
        return b.replies - a.replies;
      case 'recent':
      default:
        return new Date(b.lastActivity) - new Date(a.lastActivity);
    }
  });

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'algorithms':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'contests':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Discussions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with the community, share knowledge, and get help
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>New Discussion</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="algorithms">Algorithms</option>
              <option value="contests">Contests</option>
              <option value="general">General</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {sortedDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${
                discussion.isPinned ? 'border-yellow-400 dark:border-yellow-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <img
                  src={discussion.author.avatar}
                  alt={discussion.author.name}
                  className="w-12 h-12 rounded-full"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {discussion.isPinned && (
                      <FireIcon className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(discussion.category)}`}>
                      {discussion.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      by {discussion.author.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Rating: {discussion.author.rating}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {discussion.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {discussion.content}
                  </p>
                  
                  {discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {discussion.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(discussion.id)}
                        className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        {discussion.isLiked ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5" />
                        )}
                        <span className="text-sm">{discussion.likes}</span>
                      </button>
                      
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                        <span className="text-sm">{discussion.replies} replies</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4" />
                        <span className="text-sm">{formatTimeAgo(discussion.lastActivity)}</span>
                      </div>
                    </div>
                    
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                      View Discussion →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Discussion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Discussion
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter discussion title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newDiscussion.category}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="algorithms">Algorithms</option>
                    <option value="contests">Contests</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Write your discussion content..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDiscussion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Create Discussion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionsPage;
