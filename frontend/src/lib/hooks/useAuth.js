"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const loading = status === "loading";
  const authenticated = status === "authenticated";

  const login = (provider = "google") => {
    signIn(provider);
  };

  const logout = () => {
    signOut();
  };

  return {
    user,
    loading,
    authenticated,
    login,
    logout,
    session,
  };
}
