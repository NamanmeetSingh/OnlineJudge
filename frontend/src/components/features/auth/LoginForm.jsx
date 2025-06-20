"use client";

import { useState } from 'react';
import { useAuth } from "../../../lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Button from '../../common/Button';
import Card from '../../common/Card';
import Input from '../../common/Input';

export default function LoginForm() {
  const [isLocalLogin, setIsLocalLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading, authenticated, login, loginWithGoogle, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authenticated && user) {
      router.push('/dashboard');
    }
  }, [authenticated, user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="mb-4">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h2>
              <p className="text-gray-600 mt-2">{user?.email}</p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in to your account to continue
          </p>

          {!isLocalLogin ? (
            // OAuth and Local Login Options
            <div className="space-y-4">
              <Button
                onClick={loginWithGoogle}
                className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                onClick={() => setIsLocalLogin(true)}
                variant="outline"
                className="w-full"
              >
                Sign in with Email
              </Button>
            </div>
          ) : (
            // Email/Password Login Form
            <div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleLocalLogin} className="space-y-4">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-4">
                <Button
                  onClick={() => setIsLocalLogin(false)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Other Options
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Button 
                href="/auth/register" 
                variant="outline" 
                className="text-blue-600 hover:text-blue-800 p-0 border-0 bg-transparent hover:bg-transparent"
              >
                Create one here
              </Button>
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
}
