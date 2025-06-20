"use client";

import React from 'react'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/common/Button';
import { useAuth } from '@/lib/hooks/useAuth'

const page = () => {
  const { authenticated, user, login } = useAuth();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
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
                  <Button href="/dashboard" className="bg-blue-600 hover:bg-blue-700">
                    Go to Dashboard
                  </Button>
                  <Button href="/problems" variant="outline">
                    Browse Problems
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={() => login()}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  Sign in with Google to Get Started
                </Button>
                <p className="text-sm text-gray-500">
                  Join thousands of developers improving their coding skills
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default page