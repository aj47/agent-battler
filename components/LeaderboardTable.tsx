"use client";

import Link from "next/link";
import { Trophy, Medal, Award } from "lucide-react";
import { TierBadge } from "./TierBadge";
import type { Id } from "@/convex/_generated/dataModel";

type Tier = "builder" | "contributor" | "core" | "architect";

interface LeaderboardUser {
  rank: number;
  _id: Id<"users">;
  name?: string | null;
  githubUsername?: string | null;
  image?: string | null;
  totalPoints: number;
  tier: Tier;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  showRank?: boolean;
  compact?: boolean;
}

export function LeaderboardTable({ users, showRank = true, compact = false }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-transparent";
    if (rank === 2) return "bg-gradient-to-r from-gray-500/10 to-transparent";
    if (rank === 3) return "bg-gradient-to-r from-orange-500/10 to-transparent";
    return "";
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No contributors yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#222222]">
      {users.map((user) => (
        <div
          key={user._id}
          className={`${compact ? "p-3" : "p-4"} flex items-center space-x-3 hover:bg-[#111111] transition-colors ${getRankBgColor(user.rank)}`}
        >
          {/* Rank */}
          {showRank && (
            <div className="flex-shrink-0 w-8 flex items-center justify-center">
              {getRankIcon(user.rank)}
            </div>
          )}

          {/* Avatar */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className={`${compact ? "h-8 w-8" : "h-10 w-10"} rounded-full flex-shrink-0`}
            />
          ) : (
            <div
              className={`${compact ? "h-8 w-8" : "h-10 w-10"} rounded-full bg-[#00FF41]/20 flex items-center justify-center text-[#00FF41] font-bold flex-shrink-0`}
            >
              {(user.name || user.githubUsername || "?")[0].toUpperCase()}
            </div>
          )}

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className={`${compact ? "text-sm" : "text-base"} font-semibold text-white truncate`}>
              {user.name || user.githubUsername}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{user.githubUsername ?? "unknown"}
            </p>
          </div>

          {/* Tier Badge */}
          <div className="hidden sm:block">
            <TierBadge tier={user.tier} size="sm" />
          </div>

          {/* Points */}
          <div className="text-right flex-shrink-0">
            <p className={`${compact ? "text-base" : "text-lg"} font-bold text-[#00FF41]`}>
              {user.totalPoints.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">points</p>
          </div>
        </div>
      ))}
    </div>
  );
}
