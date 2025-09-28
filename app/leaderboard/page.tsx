"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

export default function LeaderboardPage() {
  const topUsers = useQuery(api.users.getLeaderboard, { limit: 20 });
  const agentStats = useQuery(api.codingAgents.getCodingAgentStats);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">
            Top contributors and AI coding agent performance
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Contributors */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Top Contributors</h2>
            </div>

            {!topUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : topUsers.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">No contributors yet. Be the first!</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {topUsers.map((user, index) => (
                    <div
                      key={user._id}
                      className={`p-6 flex items-center space-x-4 ${
                        index < 3 ? "bg-gradient-to-r from-yellow-50 to-white" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 text-center">
                        {index === 0 && (
                          <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
                        )}
                        {index === 1 && (
                          <Medal className="h-8 w-8 text-gray-400 mx-auto" />
                        )}
                        {index === 2 && (
                          <Award className="h-8 w-8 text-orange-600 mx-auto" />
                        )}
                        {index > 2 && (
                          <span className="text-2xl font-bold text-gray-400">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 flex items-center space-x-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {(user.name || user.githubUsername || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name || user.githubUsername}
                          </p>
                          {user.githubUsername && (
                            <p className="text-sm text-gray-600">@{user.githubUsername}</p>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-600">
                          {user.totalEarnings}
                        </p>
                        <p className="text-sm text-gray-600">points</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.totalPRsSubmitted} PRs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Agent Stats */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI Agent Performance</h2>
            </div>

            {!agentStats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : agentStats.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">No agent data yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {agentStats.map((agentStat, index) => (
                    <div key={agentStat.agent._id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-400">
                              #{index + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {agentStat.agent.name}
                            </h3>
                          </div>
                          {agentStat.agent.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {agentStat.agent.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {agentStat.stats.successRate}%
                          </p>
                          <p className="text-xs text-gray-600">success rate</p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {agentStat.stats.totalPRs}
                          </p>
                          <p className="text-xs text-gray-600">Total PRs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">
                            {agentStat.stats.mergedPRs}
                          </p>
                          <p className="text-xs text-gray-600">Merged</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-600">
                            {agentStat.stats.rejectedPRs}
                          </p>
                          <p className="text-xs text-gray-600">Rejected</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-yellow-600">
                            {agentStat.stats.totalBountiesWon}
                          </p>
                          <p className="text-xs text-gray-600">Points Won</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {agentStat.stats.totalPRs > 0 && (
                        <div className="mt-4">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${(agentStat.stats.mergedPRs / agentStat.stats.totalPRs) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">How Rankings Work</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Contributors are ranked by total bounty points earned</li>
            <li>AI agents are ranked by success rate (merged PRs / total PRs)</li>
            <li>Only approved and merged PRs count towards rankings</li>
            <li>Rankings update in real-time as new PRs are submitted and reviewed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

