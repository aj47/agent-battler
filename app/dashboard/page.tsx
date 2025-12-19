"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { TierBadge, TierProgress } from "@/components/PointsBadge";
import {
  Zap,
  Folder,
  GitPullRequest,
  Gift,
  ArrowRight,
  ExternalLink,
  Check,
  Clock,
  X,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const userStats = useQuery(
    api.users.getUserStats,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const myProjects = useQuery(api.projects.getMyProjects);
  const myContributions = useQuery(api.contributions.getMyContributions, {});
  const tierInfo = useQuery(api.users.getCurrentUserTierInfo);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">Please sign in to view your dashboard.</p>
            <Link
              href="/auth/signin"
              className="text-[#00FF41] hover:underline mt-2 inline-block"
            >
              Sign in with GitHub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const contributionStatusConfig = {
    pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-900/30" },
    verified: { icon: Check, color: "text-green-400", bg: "bg-green-900/30" },
    rejected: { icon: X, color: "text-red-400", bg: "bg-red-900/30" },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {currentUser.name || currentUser.githubUsername}!
            </p>
          </div>
          {currentUser.tier && (
            <TierBadge tier={currentUser.tier as any} size="lg" />
          )}
        </div>

        {/* Tier Progress */}
        {tierInfo && (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-[#00FF41]" />
              <h2 className="text-lg font-semibold text-white">Your Progress</h2>
            </div>
            <TierProgress
              currentPoints={tierInfo.currentPoints}
              currentTier={tierInfo.currentTier}
              nextTier={tierInfo.nextTier}
              pointsToNext={tierInfo.pointsToNextTier}
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Points</p>
                <p className="text-3xl font-bold text-[#00FF41]">
                  {currentUser.totalPoints ?? 0}
                </p>
              </div>
              <div className="bg-[#00FF41]/20 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-[#00FF41]" />
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">My Projects</p>
                <p className="text-3xl font-bold text-white">
                  {userStats?.stats.projectsOwned || 0}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Folder className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Contributions</p>
                <p className="text-3xl font-bold text-white">
                  {userStats?.stats.contributionsVerified || 0}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <GitPullRequest className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Rewards Redeemed</p>
                <p className="text-3xl font-bold text-white">
                  {userStats?.stats.rewardsRedeemed || 0}
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Gift className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">My Projects</h2>
              <Link
                href="/projects/submit"
                className="text-[#00FF41] hover:text-[#00FF41]/80 font-medium text-sm flex items-center"
              >
                Submit New
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {!myProjects ? (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-[#222222] rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-[#222222] rounded w-full mb-2"></div>
                <div className="h-4 bg-[#222222] rounded w-2/3"></div>
              </div>
            ) : myProjects.length === 0 ? (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
                <Folder className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">You haven&apos;t submitted any projects yet.</p>
                <Link
                  href="/projects/submit"
                  className="inline-flex items-center mt-4 text-[#00FF41] hover:text-[#00FF41]/80 font-medium"
                >
                  Submit your first project
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myProjects.slice(0, 3).map((project: any) => (
                  <div
                    key={project._id}
                    className="bg-[#111111] border border-[#222222] rounded-xl p-4 hover:border-[#333333] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/projects/${project._id}`}
                        className="font-semibold text-white hover:text-[#00FF41] transition-colors"
                      >
                        {project.title}
                      </Link>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          project.status === "active"
                            ? "bg-green-900/30 text-green-400"
                            : project.status === "paused"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">{project.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{project.contributionCount ?? 0} contributions</span>
                      <a
                        href={project.githubRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#00FF41] transition-colors"
                      >
                        View on GitHub
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
                {myProjects.length > 3 && (
                  <Link
                    href="/projects?mine=true"
                    className="block text-center text-sm text-gray-400 hover:text-[#00FF41] transition-colors"
                  >
                    View all {myProjects.length} projects
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* My Contributions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">My Contributions</h2>
              <Link
                href="/projects"
                className="text-[#00FF41] hover:text-[#00FF41]/80 font-medium text-sm flex items-center"
              >
                Find Projects
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {!myContributions ? (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-[#222222] rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-[#222222] rounded w-full mb-2"></div>
                <div className="h-4 bg-[#222222] rounded w-2/3"></div>
              </div>
            ) : myContributions.length === 0 ? (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
                <GitPullRequest className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">You haven&apos;t made any contributions yet.</p>
                <Link
                  href="/projects"
                  className="inline-flex items-center mt-4 text-[#00FF41] hover:text-[#00FF41]/80 font-medium"
                >
                  Find projects to contribute to
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myContributions.slice(0, 5).map((contribution: any) => {
                  const statusConfig = contributionStatusConfig[contribution.status as keyof typeof contributionStatusConfig];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={contribution._id}
                      className="bg-[#111111] border border-[#222222] rounded-xl p-4 hover:border-[#333333] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1 rounded ${statusConfig.bg}`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.color}`} />
                            </div>
                            <span className="text-sm font-medium text-white capitalize">
                              {contribution.type.replace("_", " ")}
                            </span>
                            <span className="text-[#00FF41] font-medium text-sm">
                              +{contribution.pointsAwarded} pts
                            </span>
                          </div>
                          {contribution.project && (
                            <Link
                              href={`/projects/${contribution.projectId}`}
                              className="text-sm text-gray-400 hover:text-[#00FF41] transition-colors truncate block"
                            >
                              {contribution.project.title}
                            </Link>
                          )}
                          <a
                            href={contribution.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-[#00FF41] transition-colors flex items-center gap-1 mt-1"
                          >
                            View on GitHub
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {myContributions.length > 5 && (
                  <Link
                    href="/profile/contributions"
                    className="block text-center text-sm text-gray-400 hover:text-[#00FF41] transition-colors"
                  >
                    View all {myContributions.length} contributions
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/projects/submit"
            className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#00FF41]/30 transition-colors group"
          >
            <Folder className="h-8 w-8 text-blue-400 mb-3 group-hover:text-[#00FF41] transition-colors" />
            <h3 className="font-semibold text-white mb-1">Submit a Project</h3>
            <p className="text-sm text-gray-400">Share your project and get help from the community</p>
          </Link>

          <Link
            href="/projects"
            className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#00FF41]/30 transition-colors group"
          >
            <GitPullRequest className="h-8 w-8 text-green-400 mb-3 group-hover:text-[#00FF41] transition-colors" />
            <h3 className="font-semibold text-white mb-1">Contribute</h3>
            <p className="text-sm text-gray-400">Find projects and earn points by contributing</p>
          </Link>

          <Link
            href="/rewards"
            className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#00FF41]/30 transition-colors group"
          >
            <Gift className="h-8 w-8 text-purple-400 mb-3 group-hover:text-[#00FF41] transition-colors" />
            <h3 className="font-semibold text-white mb-1">Redeem Rewards</h3>
            <p className="text-sm text-gray-400">Use your points for Discord roles and more</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
