"use client";
import { useState } from "react";
import Button from "../common/Button";
import { useAuth } from "../../lib/hooks/useAuth";

export default function Navbar() {
  const { user, authenticated, loading, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-gray-100 px-6 py-3 flex items-center justify-between w-full fixed top-0 left-0 z-50 shadow">
      {/* Left: Brand */}
      <div className="font-bold text-lg tracking-wide">Online Judge</div>
      {/* Right: Buttons */}
      <div className="flex items-center gap-3">
        <Button href="/problems" variant="secondary" className="text-sm">
          Problems
        </Button>
        <Button href="/contests" variant="secondary" className="text-sm">
          Contests        </Button>
        <Button href="/about" variant="secondary" className="text-sm">
          About
        </Button>
        {loading ? (
          <div className="animate-pulse bg-gray-700 h-8 w-16 rounded"></div>
        ) : authenticated ? (
          <>
            <div className="flex items-center gap-2">
              {user?.image && (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm">{user?.name}</span>
            </div>
            <Button href="/dashboard" variant="outline" className="text-sm">
              Dashboard
            </Button>
            <Button
              variant="danger"
              className="text-sm"
              onClick={logout}
            >
              Logout
            </Button>
          </>        ) : (
          <>
            <Button href="/auth/login" variant="primary" className="text-sm">
              Sign In
            </Button>
            <Button href="/auth/register" variant="outline" className="text-sm">
              Register
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}