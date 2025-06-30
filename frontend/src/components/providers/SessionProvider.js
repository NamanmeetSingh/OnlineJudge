"use client";

import { AuthProvider } from '../../lib/hooks/useAuth';

export function SessionProvider({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
