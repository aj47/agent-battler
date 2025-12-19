"use client";

import Link from "next/link";
import { Hammer, Trophy, GitPullRequest, Users, ArrowRight, Zap, Star, Crown, Gem, Gift } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const topUsers = useQuery(api.users.getLeaderboard, { limit: 5 });
  const featuredProjects = useQuery(api.projects.getFeaturedProjects, { limit: 3 });

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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Builders helping <span className="text-[#00FF41]">builders</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Submit your projects, contribute to the community, earn points, and unlock exclusive rewards.
            Join a community of developers building together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
            >
              Explore Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/projects/submit"
              className="inline-flex items-center justify-center px-8 py-3 border border-[#333333] text-base font-medium rounded-lg text-white bg-transparent hover:bg-[#111111] transition-colors"
            >
              Submit Your Project
            </Link>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
            <GitPullRequest className="h-8 w-8 text-[#00FF41] mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">50</p>
            <p className="text-sm text-gray-400">Points per PR</p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">30</p>
            <p className="text-sm text-gray-400">Points per Issue</p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">20</p>
            <p className="text-sm text-gray-400">Points per Review</p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
            <Gift className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">6+</p>
            <p className="text-sm text-gray-400">Rewards Available</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          {/* Featured Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
              <Link
                href="/projects"
                className="text-[#00FF41] hover:text-[#00FF41]/80 font-medium flex items-center text-sm"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {!featuredProjects ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-[#222222] rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-[#222222] rounded w-full mb-2"></div>
                    <div className="h-4 bg-[#222222] rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : featuredProjects.length > 0 ? (
              <div className="space-y-4">
                {featuredProjects.map((project: any) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-12 text-center">
                <Hammer className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No projects yet. Be the first to submit one!</p>
                <Link
                  href="/projects/submit"
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
                >
                  Submit Your Project
                </Link>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div>
            <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#00FF41]/20 to-transparent px-6 py-4 border-b border-[#222222]">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-[#00FF41]" />
                  <h2 className="text-xl font-bold text-white">Top Contributors</h2>
                </div>
              </div>

              {!topUsers ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-[#222222]"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-[#222222] rounded w-24 mb-1"></div>
                        <div className="h-3 bg-[#222222] rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : topUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400">No contributors yet. Be the first!</p>
                </div>
              ) : (
                <div className="divide-y divide-[#222222]">
                  {topUsers.map((user, index) => {
                    const TierIcon = tierIcons[(user.tier as keyof typeof tierIcons) || "builder"];
                    const tierColor = tierColors[(user.tier as keyof typeof tierColors) || "builder"];
                    return (
                      <div
                        key={user._id}
                        className={`p-4 flex items-center space-x-3 ${
                          index === 0 ? "bg-gradient-to-r from-[#00FF41]/10 to-transparent" : ""
                        }`}
                      >
                        <div className="flex-shrink-0 w-6 text-center">
                          {index === 0 ? (
                            <span className="text-[#00FF41] font-bold">1</span>
                          ) : (
                            <span className="text-gray-500 font-medium">{index + 1}</span>
                          )}
                        </div>

                        {(user.image || user.avatar_url) ? (
                          <img
                            src={user.image || user.avatar_url}
                            alt={user.name || "User"}
                            className="h-10 w-10 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#00FF41]/20 flex items-center justify-center text-[#00FF41] font-bold flex-shrink-0">
                            {(user.name || user.githubUsername || "?")[0].toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {user.name || user.githubUsername}
                          </p>
                          <div className="flex items-center gap-1">
                            <TierIcon className={`h-3 w-3 ${tierColor}`} />
                            <p className={`text-xs capitalize ${tierColor}`}>
                              {user.tier || "builder"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-[#00FF41]">
                            {user.totalPoints ?? 0}
                          </p>
                          <p className="text-xs text-gray-500">pts</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="px-6 py-4 bg-[#0A0A0A] border-t border-[#222222]">
                <Link
                  href="/leaderboard"
                  className="block w-full text-center px-4 py-2 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-medium rounded-lg transition-colors"
                >
                  View Full Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-24">
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
                Share your GitHub project and describe what help you need
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-white mb-2">Contribute to Others</h4>
              <p className="text-sm text-gray-400">
                Find projects that need help and submit PRs, reviews, or issues
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-white mb-2">Earn Points</h4>
              <p className="text-sm text-gray-400">
                Get verified contributions and earn points for your work
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#00FF41] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-white mb-2">Unlock Rewards</h4>
              <p className="text-sm text-gray-400">
                Redeem points for Discord roles, shoutouts, and stream features
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-[#111111] p-8 rounded-xl border border-[#222222]">
            <div className="bg-[#00FF41]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Hammer className="h-6 w-6 text-[#00FF41]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Share Your Projects
            </h3>
            <p className="text-gray-400">
              Submit your GitHub repos and let the community know what kind of help you need.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-xl border border-[#222222]">
            <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <GitPullRequest className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Contribute & Earn
            </h3>
            <p className="text-gray-400">
              Submit PRs, provide feedback, and help resolve issues to earn points.
            </p>
          </div>

          <div className="bg-[#111111] p-8 rounded-xl border border-[#222222]">
            <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Gift className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Redeem Rewards
            </h3>
            <p className="text-gray-400">
              Unlock Discord roles, social shoutouts, and featured streams with your points.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 bg-gradient-to-r from-[#00FF41]/20 to-[#00FF41]/5 rounded-2xl p-12 text-center border border-[#00FF41]/30">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to join the community?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Sign in with GitHub to submit your projects, contribute to others, and start earning rewards.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
