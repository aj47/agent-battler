"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TierBadge } from "@/components/TierBadge";
import { PointsBadge } from "@/components/PointsBadge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  GitFork,
  ExternalLink,
  Clock,
  Zap,
  Shield,
  ArrowRight,
  Settings,
  Save,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const profileData = useQuery(api.users.getProfileData, {});
  const pointInfo = useQuery(api.points.getMyPointInfo);
  const tiersInfo = useQuery(api.points.getAllTiersInfo);
  const updateProfile = useMutation(api.users.updateUserProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [discordId, setDiscordId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF41] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const { user, projects, contributions, redemptions } = profileData;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ discordId: discordId || undefined });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tier = (user.tier || "builder") as "builder" | "contributor" | "core" | "architect";

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                  <span className="text-[#00FF41] font-bold text-3xl">
                    {(user.name || user.githubUsername || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.name || user.githubUsername}
                </h1>
                <p className="text-gray-400">@{user.githubUsername}</p>
                <div className="mt-2">
                  <TierBadge tier={tier} />
                </div>
              </div>
            </div>
            <div className="text-right">
              <PointsBadge
                points={user.totalPoints}
                tier={tier}
                showTier={false}
                size="lg"
              />
              {user.createdAt && (
                <p className="text-sm text-gray-400 mt-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Joined {formatDate(user.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Progress to next tier */}
          {pointInfo && pointInfo.nextTier && (
            <div className="mt-6 pt-6 border-t border-[#222222]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  Progress to {pointInfo.nextTier}
                </span>
                <span className="text-sm text-[#00FF41]">
                  {pointInfo.pointsToNextTier} pts to go
                </span>
              </div>
              <div className="h-2 bg-[#222222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00FF41] transition-all"
                  style={{ width: `${pointInfo.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Discord ID */}
          <div className="mt-6 pt-6 border-t border-[#222222]">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="Enter your Discord ID"
                  className="flex-1 px-4 py-2 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#00FF41] text-black rounded-lg hover:bg-[#00CC33] transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Discord ID</p>
                  <p className="text-white">
                    {user.discordId || "Not set"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDiscordId(user.discordId || "");
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tier Progress */}
        {tiersInfo && (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-[#00FF41]" />
              Tier Progress
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(tiersInfo).map(([tierKey, info]) => {
                const isCurrentTier = tierKey === tier;
                const isUnlocked = user.totalPoints >= info.minPoints;
                return (
                  <div
                    key={tierKey}
                    className={`p-4 rounded-lg border ${
                      isCurrentTier
                        ? "border-[#00FF41] bg-[#00FF41]/10"
                        : isUnlocked
                        ? "border-[#222222] bg-[#0A0A0A]"
                        : "border-[#222222] bg-[#0A0A0A] opacity-50"
                    }`}
                  >
                    <TierBadge tier={tierKey as "builder" | "contributor" | "core" | "architect"} size="sm" />
                    <p className="text-xs text-gray-400 mt-2">{info.description}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: info.color }}>
                      {info.minPoints}+ pts
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Projects */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">My Projects</h2>
            <Link
              href="/projects/submit"
              className="text-[#00FF41] text-sm hover:underline flex items-center"
            >
              Submit New
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              You haven&apos;t submitted any projects yet.
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/projects/${project._id}`}
                  className="block p-4 hover:bg-[#0A0A0A] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{project.title}</h3>
                      <p className="text-sm text-gray-400 flex items-center">
                        <GitFork className="h-3 w-3 mr-1" />
                        {project.githubRepoOwner}/{project.githubRepoName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : project.status === "paused"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Contributions */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[#222222]">
            <h2 className="text-lg font-bold text-white">My Contributions</h2>
          </div>

          {contributions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              You haven&apos;t made any contributions yet.
              <Link href="/projects" className="text-[#00FF41] hover:underline block mt-2">
                Browse projects to contribute
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {contributions.map((contribution) => (
                <div key={contribution._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/projects/${contribution.projectId}`}
                        className="font-medium text-white hover:text-[#00FF41]"
                      >
                        {contribution.project?.title || "Unknown Project"}
                      </Link>
                      <a
                        href={contribution.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-[#00FF41] flex items-center"
                      >
                        {contribution.title || contribution.githubUrl}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contribution.status === "verified"
                            ? "bg-green-500/20 text-green-400"
                            : contribution.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {contribution.status}
                      </span>
                      {contribution.status === "verified" && (
                        <span className="text-[#00FF41] font-bold flex items-center">
                          <Zap className="h-4 w-4 mr-1" />
                          +{contribution.pointsAwarded}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redemption History */}
        {redemptions.length > 0 && (
          <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#222222]">
              <h2 className="text-lg font-bold text-white">Redemption History</h2>
            </div>
            <div className="divide-y divide-[#222222]">
              {redemptions.map((redemption) => (
                <div key={redemption._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{redemption.reward?.name}</p>
                    <p className="text-sm text-gray-400">{formatDate(redemption.redeemedAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      redemption.status === "fulfilled"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {redemption.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
