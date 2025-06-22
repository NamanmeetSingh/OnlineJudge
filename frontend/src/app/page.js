"use client";

import React from 'react'
import Button from '@/components/common/Button';
import { useAuth } from '@/lib/hooks/useAuth'

const page = () => {
  const { authenticated, user } = useAuth();

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Online Judge
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Practice coding problems and improve your skills
          </p>
          {authenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-green-600">
                Welcome back, {user?.name}!
              </p>
              <div className="flex justify-center gap-4">
                <Button href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Go to Dashboard
                </Button>
                <Button href="/problems" variant="outline" className="px-8 py-3">
                  Browse Problems
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600 mb-6">
                Join thousands of developers improving their coding skills
              </p>
              <div className="flex justify-center gap-4">
                <Button href="/problems" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Browse Problems
                </Button>
                <Button href="/leaderboard" variant="outline" className="px-8 py-3">
                  View Leaderboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-blue-600 text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Practice Problems</h3>
            <p className="text-gray-600">Solve coding challenges across different difficulty levels and topics</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-green-600 text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Compete</h3>
            <p className="text-gray-600">Participate in contests and climb the leaderboard</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-purple-600 text-3xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your improvement with detailed analytics and badges</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page