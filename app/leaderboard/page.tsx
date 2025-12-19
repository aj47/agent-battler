"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { TierBadge } from "@/components/PointsBadge";
import { Trophy, Medal, Award, Zap, Star, Crown, Gem, Calendar } from "lucide-react";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("all");
  const leaderboard = useQuery(api.contributions.getLeaderboard, { limit: 20, period });

  const tierIcons = {
    builder: Zap,
    contributor: Star,
    core: Crown,
    architect: Gem,
  };

  const tierColors = {
    builder: "text-gray-400",
    contributor: "text-blue-400",
    core: "text-purple-400",
    architect: "text-[#00FF41]",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-gray-400">
              Top contributors in the community
            </p>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2 bg-[#111111] border border-[#222222] rounded-lg p-1">
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === "week"
                  ? "bg-[#00FF41] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === "month"
                  ? "bg-[#00FF41] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === "all"
                  ? "bg-[#00FF41] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Top 3 Highlight */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Second Place */}
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center order-1">
              <Medal className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <div className="relative inline-block mb-3">
                {(leaderboard[1].image || leaderboard[1].avatar_url) ? (
                  <img
                    src={leaderboard[1].image || leaderboard[1].avatar_url}
                    alt={leaderboard[1].name || "User"}
                    className="h-16 w-16 rounded-full mx-auto"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl mx-auto">
                    {(leaderboard[1].name || leaderboard[1].githubUsername || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-semibold text-white truncate">
                {leaderboard[1].name || leaderboard[1].githubUsername}
              </p>
              <p className="text-2xl font-bold text-gray-400 mt-1">
                {leaderboard[1].totalPoints.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">points</p>
            </div>

            {/* First Place */}
            <div className="bg-gradient-to-b from-[#00FF41]/20 to-[#111111] border border-[#00FF41]/30 rounded-xl p-6 text-center order-0 md:order-1 transform md:-translate-y-4">
              <Trophy className="h-10 w-10 text-[#00FF41] mx-auto mb-3" />
              <div className="relative inline-block mb-3">
                {(leaderboard[0].image || leaderboard[0].avatar_url) ? (
                  <img
                    src={leaderboard[0].image || leaderboard[0].avatar_url}
                    alt={leaderboard[0].name || "User"}
                    className="h-20 w-20 rounded-full mx-auto border-2 border-[#00FF41]"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[#00FF41]/20 flex items-center justify-center text-[#00FF41] font-bold text-2xl mx-auto border-2 border-[#00FF41]">
                    {(leaderboard[0].name || leaderboard[0].githubUsername || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-semibold text-white text-lg truncate">
                {leaderboard[0].name || leaderboard[0].githubUsername}
              </p>
              <p className="text-3xl font-bold text-[#00FF41] mt-1">
                {leaderboard[0].totalPoints.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">points</p>
            </div>

            {/* Third Place */}
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center order-2">
              <Award className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <div className="relative inline-block mb-3">
                {(leaderboard[2].image || leaderboard[2].avatar_url) ? (
                  <img
                    src={leaderboard[2].image || leaderboard[2].avatar_url}
                    alt={leaderboard[2].name || "User"}
                    className="h-16 w-16 rounded-full mx-auto"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-400 font-bold text-xl mx-auto">
                    {(leaderboard[2].name || leaderboard[2].githubUsername || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-semibold text-white truncate">
                {leaderboard[2].name || leaderboard[2].githubUsername}
              </p>
              <p className="text-2xl font-bold text-orange-400 mt-1">
                {leaderboard[2].totalPoints.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222222] flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#00FF41]" />
            <h2 className="text-lg font-semibold text-white">Rankings</h2>
            {period !== "all" && (
              <span className="ml-2 px-2 py-0.5 bg-[#222222] text-gray-400 text-xs rounded-full flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {period === "week" ? "This Week" : "This Month"}
              </span>
            )}
          </div>

          {!leaderboard ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF41] mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No contributors yet for this period.</p>
              <p className="text-sm text-gray-500 mt-1">Be the first to contribute and earn points!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {leaderboard.map((user: any, index: number) => {
                const TierIcon = tierIcons[(user.tier as keyof typeof tierIcons) || "builder"];
                const tierColor = tierColors[(user.tier as keyof typeof tierColors) || "builder"];

                return (
                  <div
                    key={user._id}
                    className={`p-4 flex items-center space-x-4 hover:bg-[#1a1a1a] transition-colors ${
                      index < 3 ? "bg-gradient-to-r from-[#00FF41]/5 to-transparent" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {index === 0 && (
                        <span className="text-xl font-bold text-[#00FF41]">1</span>
                      )}
                      {index === 1 && (
                        <span className="text-xl font-bold text-gray-400">2</span>
                      )}
                      {index === 2 && (
                        <span className="text-xl font-bold text-orange-400">3</span>
                      )}
                      {index > 2 && (
                        <span className="text-lg font-medium text-gray-500">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 flex items-center space-x-3 min-w-0">
                      {(user.image || user.avatar_url) ? (
                        <img
                          src={user.image || user.avatar_url}
                          alt={user.name || "User"}
                          className="h-10 w-10 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#222222] flex items-center justify-center text-gray-400 font-bold flex-shrink-0">
                          {(user.name || user.githubUsername || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          {user.name || user.githubUsername}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <TierIcon className={`h-3.5 w-3.5 ${tierColor}`} />
                          <span className={`text-xs capitalize ${tierColor}`}>
                            {user.tier || "builder"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-[#00FF41]">
                        {user.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-[#111111] border border-[#222222] rounded-xl p-6">
          <h3 className="font-semibold text-white mb-3">How Points Work</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">50 pts</p>
                <p className="text-gray-400">Merged PR</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">30 pts</p>
                <p className="text-gray-400">Issue Resolved</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">20 pts</p>
                <p className="text-gray-400">Feedback Accepted</p>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Points are awarded when project owners verify your contributions.
          </p>
        </div>
      </div>
    </div>
  );
}
