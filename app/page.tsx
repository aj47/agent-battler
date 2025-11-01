"use client";

import Link from "next/link";
import { Code2, Trophy, GitPullRequest, DollarSign, ArrowRight, TrendingUp, Medal, Award } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const topUsers = useQuery(api.users.getLeaderboard, { limit: 4 });
  const agentStats = useQuery(api.codingAgents.getCodingAgentStats);
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Battle of the <span className="text-blue-600">AI Coding Agents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Post GitHub issues with bounties. Contributors solve them using their favorite AI coding agents.
            Track which agents win the most bounties!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/issues"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Browse Issues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/issues/create"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Post an Issue
            </Link>
          </div>
        </div>

        {/* Leaderboard Snippets */}
        <div className="mt-16 grid lg:grid-cols-2 gap-8">
          {/* Top Contributors */}
          <div className="h-[500px]">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Top Contributors</h2>
                </div>
              </div>

              {!topUsers ? (
                <div className="text-center py-8 flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : topUsers.length === 0 ? (
                <div className="p-8 text-center flex-1">
                  <p className="text-gray-600">No contributors yet. Be the first to earn bounties!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 flex-1 overflow-auto">
                  {topUsers.map((user, index) => (
                    <div
                      key={user._id}
                      className={`p-4 flex items-center space-x-3 min-h-[88px] ${
                        index === 0 ? "bg-gradient-to-r from-yellow-50 to-white" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 text-center">
                        {index === 0 && (
                          <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
                        )}
                        {index === 1 && (
                          <Medal className="h-5 w-5 text-gray-400 mx-auto" />
                        )}
                        {index === 2 && (
                          <Award className="h-5 w-5 text-orange-600 mx-auto" />
                        )}
                        {index > 2 && (
                          <span className="text-sm font-bold text-gray-400">
                            #{index + 1}
                          </span>
                        )}
                      </div>

                      {/* Profile Image */}
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="h-10 w-10 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {(user.name || user.githubUsername || "?")[0].toUpperCase()}
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name || user.githubUsername}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{user.githubUsername}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-yellow-600">
                          {user.totalEarnings}
                        </p>
                        <p className="text-xs text-gray-600">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
                <Link
                  href="/leaderboard"
                  className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  View the Full Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* Top AI Agents */}
          <div className="h-[500px]">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Top AI Agents</h2>
                </div>
              </div>

              {!agentStats ? (
                <div className="text-center py-8 flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : agentStats.length === 0 ? (
                <div className="p-8 text-center flex-1">
                  <p className="text-gray-600">No agent data yet. Start submitting PRs!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 flex-1 overflow-auto">
                  {agentStats.slice(0, 3).map((agentStat, index) => (
                    <div key={agentStat.agent._id} className="p-4 flex flex-col justify-center min-h-[88px]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-400">
                              #{index + 1}
                            </span>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {agentStat.agent.name}
                            </h3>
                          </div>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <p className="text-lg font-bold text-green-600">
                            {agentStat.stats.successRate}%
                          </p>
                          <p className="text-xs text-gray-600">success</p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">
                            {agentStat.stats.totalPRs}
                          </p>
                          <p className="text-xs text-gray-600">PRs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-green-600">
                            {agentStat.stats.mergedPRs}
                          </p>
                          <p className="text-xs text-gray-600">Merged</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-red-600">
                            {agentStat.stats.rejectedPRs}
                          </p>
                          <p className="text-xs text-gray-600">Rejected</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-yellow-600">
                            {agentStat.stats.totalBountiesWon}
                          </p>
                          <p className="text-xs text-gray-600">Points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
                <Link
                  href="/leaderboard"
                  className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  View the Full Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Post Issues with Bounties
            </h3>
            <p className="text-gray-600">
              Select issues from your GitHub repositories and attach bounty points to incentivize solutions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <GitPullRequest className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Submit PRs with AI Agents
            </h3>
            <p className="text-gray-600">
              Solve issues using Augment, Cursor, Copilot, or any AI coding tool and submit your PR.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Track Agent Performance
            </h3>
            <p className="text-gray-600">
              See which AI coding agents win the most bounties and have the highest success rates.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sign in with GitHub</h4>
              <p className="text-sm text-gray-600">
                Authenticate using your GitHub account
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Post or Browse Issues</h4>
              <p className="text-sm text-gray-600">
                Post issues with bounties or find issues to solve
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Submit Solutions</h4>
              <p className="text-sm text-gray-600">
                Create PRs using your favorite AI coding agent
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Earn Bounties</h4>
              <p className="text-sm text-gray-600">
                Get approved and earn bounty points
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
