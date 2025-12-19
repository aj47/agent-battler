"use client";

import Link from "next/link";
import { Users, GitPullRequest, Gift, ArrowRight, Trophy, Zap, Heart, Code2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const topUsers = useQuery(api.contributions.getLeaderboard, { limit: 5 });
  const featuredProjects = useQuery(api.projects.getFeaturedProjects, { limit: 6 });
  const stats = useQuery(api.contributions.getContributionStats);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FF41]/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-[#00FF41]/10 px-4 py-2 rounded-full mb-6 border border-[#00FF41]/20">
              <Heart className="h-4 w-4 text-[#00FF41]" />
              <span className="text-[#00FF41] text-sm font-medium">Builders helping builders</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Build Together,{" "}
              <span className="text-[#00FF41]">Grow Together</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Submit your GitHub projects, contribute to others, and earn points.
              Turn your contributions into real rewards like Discord roles, shoutouts, and stream features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00CC33] transition-colors"
              >
                Explore Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/projects/submit"
                className="inline-flex items-center justify-center px-8 py-3 border border-[#222222] text-base font-medium rounded-lg text-white bg-[#111111] hover:bg-[#1a1a1a] transition-colors"
              >
                Submit Your Project
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-[#00FF41] mb-1">
                {stats?.totalContributions ?? 0}
              </div>
              <div className="text-sm text-gray-400">Contributions</div>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-[#00FF41] mb-1">
                {stats?.totalPointsAwarded?.toLocaleString() ?? 0}
              </div>
              <div className="text-sm text-gray-400">Points Awarded</div>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-[#00FF41] mb-1">
                {featuredProjects?.length ?? 0}
              </div>
              <div className="text-sm text-gray-400">Active Projects</div>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-[#00FF41] mb-1">
                {topUsers?.length ?? 0}
              </div>
              <div className="text-sm text-gray-400">Contributors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Featured Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Projects Seeking Help</h2>
              <Link
                href="/projects"
                className="text-[#00FF41] hover:underline text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {!featuredProjects ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF41] mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading projects...</p>
              </div>
            ) : featuredProjects.length > 0 ? (
              <div className="grid gap-4">
                {featuredProjects.slice(0, 4).map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#111111] rounded-xl border border-[#222222]">
                <Code2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No projects available yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Be the first to submit your project!
                </p>
                <Link
                  href="/projects/submit"
                  className="inline-flex items-center justify-center px-6 py-2 mt-4 text-sm font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00CC33] transition-colors"
                >
                  Submit a Project
                </Link>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden sticky top-20">
              <div className="bg-gradient-to-r from-[#00FF41]/10 to-transparent px-6 py-4 border-b border-[#222222]">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-[#00FF41]" />
                  <h2 className="text-lg font-bold text-white">Top Contributors</h2>
                </div>
              </div>

              {!topUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF41] mx-auto"></div>
                </div>
              ) : (
                <LeaderboardTable users={topUsers} compact />
              )}

              <div className="px-4 py-4 border-t border-[#222222]">
                <Link
                  href="/leaderboard"
                  className="block w-full text-center px-4 py-2 bg-[#00FF41] hover:bg-[#00CC33] text-black font-medium rounded-lg transition-colors"
                >
                  View Full Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-white mb-2">Submit Your Project</h4>
              <p className="text-sm text-gray-400">
                Share your GitHub repo and what help you need
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-white mb-2">Contribute to Others</h4>
              <p className="text-sm text-gray-400">
                Submit PRs, feedback, or issues to community projects
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-white mb-2">Earn Points</h4>
              <p className="text-sm text-gray-400">
                Get points when project owners verify your contributions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-white mb-2">Redeem Rewards</h4>
              <p className="text-sm text-gray-400">
                Turn points into Discord roles, shoutouts, and more
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#111111] p-8 rounded-xl border border-[#222222]">
            <div className="bg-[#00FF41]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <GitPullRequest className="h-6 w-6 text-[#00FF41]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Contribute & Earn
            </h3>
            <p className="text-gray-400">
              Submit PRs (50 pts), resolved issues (30 pts), or feedback (20 pts) to earn points.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-xl border border-[#222222]">
            <div className="bg-[#00FF41]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-[#00FF41]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Level Up Tiers
            </h3>
            <p className="text-gray-400">
              Progress from Builder to Contributor, Core, and Architect as you earn more points.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-xl border border-[#222222]">
            <div className="bg-[#00FF41]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Gift className="h-6 w-6 text-[#00FF41]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Real Rewards
            </h3>
            <p className="text-gray-400">
              Redeem points for Discord roles, social shoutouts, and dedicated stream features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
