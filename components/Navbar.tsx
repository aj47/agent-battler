"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Hammer, Trophy, User, LogOut, Menu, X, Gift, Zap } from "lucide-react";
import { useState } from "react";
import { TierBadge } from "./PointsBadge";

export function Navbar() {
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.getCurrentUser);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0A0A0A] border-b border-[#222222] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Hammer className="h-8 w-8 text-[#00FF41]" />
              <span className="ml-2 text-xl font-bold text-white">
                Builder<span className="text-[#00FF41]">Hub</span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/projects"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-[#00FF41] transition-colors"
              >
                Browse Projects
              </Link>
              {currentUser && (
                <>
                  <Link
                    href="/projects/submit"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-[#00FF41] transition-colors"
                  >
                    Submit Project
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-[#00FF41] transition-colors"
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    Leaderboard
                  </Link>
                  <Link
                    href="/rewards"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-[#00FF41] transition-colors"
                  >
                    <Gift className="h-4 w-4 mr-1" />
                    Rewards
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side - user menu */}
          <div className="flex items-center">
            {currentUser ? (
              <>
                {/* Desktop user menu */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <Link
                    href="/notifications"
                    className="relative inline-flex items-center p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount && unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/2 -translate-y-1/2 bg-[#00FF41] rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#111111] border border-[#333333] rounded-full">
                    <Zap className="h-4 w-4 text-[#00FF41]" />
                    <span className="text-sm font-medium text-[#00FF41]">
                      {currentUser.totalPoints ?? 0}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#111111] transition-colors"
                  >
                    {currentUser.image ? (
                      <img
                        src={currentUser.image}
                        alt={currentUser.name || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#00FF41]" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-300">
                      {currentUser.name || currentUser.githubUsername}
                    </span>
                  </Link>

                  <button
                    onClick={() => void signOut()}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#111111] transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
              >
                Sign in with GitHub
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && currentUser && (
        <div className="md:hidden border-t border-[#222222]">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/projects"
              className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-[#111111]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Projects
            </Link>
            <Link
              href="/projects/submit"
              className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-[#111111]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit Project
            </Link>
            <Link
              href="/leaderboard"
              className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-[#111111]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/rewards"
              className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-[#111111]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rewards
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-[#111111]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/notifications"
              className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-[#111111]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notifications {unreadCount && unreadCount > 0 && `(${unreadCount})`}
            </Link>
            <div className="px-4 py-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#00FF41]" />
              <span className="text-[#00FF41] font-medium">
                {currentUser.totalPoints ?? 0} points
              </span>
              {currentUser.tier && (
                <TierBadge tier={currentUser.tier as any} size="sm" />
              )}
            </div>
            <button
              onClick={() => {
                void signOut();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-300 hover:bg-[#111111]"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
