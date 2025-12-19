"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { TierBadge } from "@/components/TierBadge";
import { Trophy, Users, Zap, Target } from "lucide-react";

export default function LeaderboardPage() {
  const topUsers = useQuery(api.contributions.getLeaderboard, { limit: 50 });
  const stats = useQuery(api.contributions.getContributionStats);
  const tiersInfo = useQuery(api.points.getAllTiersInfo);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-[#00FF41]/10 px-4 py-2 rounded-full mb-4 border border-[#00FF41]/20">
            <Trophy className="h-5 w-5 text-[#00FF41]" />
            <span className="text-[#00FF41] font-medium">Top Contributors</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">
            The most active contributors in our builder community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
            <Users className="h-6 w-6 text-[#00FF41] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {topUsers?.length ?? 0}
            </div>
            <div className="text-sm text-gray-400">Contributors</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
            <Target className="h-6 w-6 text-[#00FF41] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {stats?.totalContributions ?? 0}
            </div>
            <div className="text-sm text-gray-400">Contributions</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
            <Zap className="h-6 w-6 text-[#00FF41] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {stats?.totalPointsAwarded?.toLocaleString() ?? 0}
            </div>
            <div className="text-sm text-gray-400">Points Awarded</div>
          </div>
        </div>

        {/* Tiers Legend */}
        {tiersInfo && (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Tier Levels</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(tiersInfo).map(([tierKey, info]) => (
                <div key={tierKey} className="flex items-center space-x-2">
                  <TierBadge tier={tierKey as "builder" | "contributor" | "core" | "architect"} size="sm" />
                  <span className="text-xs text-gray-400">{info.minPoints}+ pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222222] bg-gradient-to-r from-[#00FF41]/10 to-transparent">
            <h2 className="text-lg font-bold text-white">All-Time Rankings</h2>
          </div>

          {!topUsers ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF41] mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading leaderboard...</p>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No contributors yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Be the first to contribute and earn points!
              </p>
            </div>
          ) : (
            <LeaderboardTable users={topUsers} />
          )}
        </div>

        {/* Point Values Info */}
        <div className="mt-8 bg-[#111111] border border-[#222222] rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to Earn Points</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0A0A0A] rounded-lg">
              <div className="text-2xl font-bold text-[#00FF41] mb-1">50 pts</div>
              <div className="text-sm text-gray-400">Merged Pull Request</div>
              <p className="text-xs text-gray-500 mt-1">
                Submit a PR that gets merged into a project
              </p>
            </div>
            <div className="p-4 bg-[#0A0A0A] rounded-lg">
              <div className="text-2xl font-bold text-[#00FF41] mb-1">30 pts</div>
              <div className="text-sm text-gray-400">Resolved Issue</div>
              <p className="text-xs text-gray-500 mt-1">
                Create an issue that gets addressed
              </p>
            </div>
            <div className="p-4 bg-[#0A0A0A] rounded-lg">
              <div className="text-2xl font-bold text-[#00FF41] mb-1">20 pts</div>
              <div className="text-sm text-gray-400">Accepted Feedback</div>
              <p className="text-xs text-gray-500 mt-1">
                Provide feedback that gets implemented
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
