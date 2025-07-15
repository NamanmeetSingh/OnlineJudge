import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DiscussionsPage from './pages/DiscussionsPage';
import ContestsPage from './pages/ContestsPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/problems" element={
                <ProtectedRoute>
                  <ProblemsPage />
                </ProtectedRoute>
              } />
              <Route path="/problem/:id" element={<ProblemDetailPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/discussions" element={
                <ProtectedRoute>
                  <DiscussionsPage />
                </ProtectedRoute>
              } />
              <Route path="/contests" element={<ContestsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/submissions" element={<div className="p-8 text-center text-gray-500">Submissions page coming soon!</div>} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
