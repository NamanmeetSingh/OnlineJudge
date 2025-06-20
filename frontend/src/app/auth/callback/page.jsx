"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      handleAuthCallback(token);
      router.push('/dashboard');
    } else if (error) {
      router.push('/auth/login?error=Authentication failed');
    } else {
      router.push('/auth/login');
    }
  }, [searchParams, handleAuthCallback, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
}
