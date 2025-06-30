// Export all API functions
export { default as apiClient, compilerClient } from './client';
export { authApi, userApi } from './auth';
export { problemsApi } from './problems';
export { submissionsApi, executionApi } from './submissions';
export { leaderboardApi, discussionsApi } from './leaderboard';

// Re-export everything for convenience
export * from './auth';
export * from './problems';
export * from './submissions';
export * from './leaderboard';
