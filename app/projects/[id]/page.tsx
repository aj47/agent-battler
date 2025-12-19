"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TierBadge } from "@/components/TierBadge";
import { ContributionForm } from "@/components/ContributionForm";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ExternalLink,
  GitFork,
  Tag,
  Users,
  Clock,
  Check,
  X,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";

type ContributionStatus = "pending" | "verified" | "rejected";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = id as Id<"projects">;

  const currentUser = useQuery(api.users.getCurrentUser);
  const project = useQuery(api.projects.getProjectById, { projectId });
  const contributions = useQuery(api.contributions.getProjectContributions, { projectId });
  const verifyContribution = useMutation(api.contributions.verifyContribution);

  const [showContributionForm, setShowContributionForm] = useState(false);
  const [verifyingId, setVerifyingId] = useState<Id<"contributions"> | null>(null);

  const isOwner = currentUser && project && currentUser._id === project.ownerId;

  const handleVerify = async (contributionId: Id<"contributions">, approved: boolean) => {
    setVerifyingId(contributionId);
    try {
      await verifyContribution({ contributionId, approved });
    } catch (error) {
      console.error("Failed to verify contribution:", error);
    } finally {
      setVerifyingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: ContributionStatus) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      verified: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      pr_merged: "PR Merged",
      feedback_accepted: "Feedback",
      issue_merged: "Issue Resolved",
    };
    return (
      <span className="px-2 py-1 text-xs font-medium bg-[#00FF41]/10 text-[#00FF41] rounded-full">
        {labels[type] || type}
      </span>
    );
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF41] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-400 hover:text-[#00FF41] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {project.owner?.image ? (
                <img
                  src={project.owner.image}
                  alt={project.owner.name || "Owner"}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                  <span className="text-[#00FF41] font-bold text-lg">
                    {(project.owner?.name || project.owner?.githubUsername || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                <p className="text-gray-400">by @{project.owner?.githubUsername || "unknown"}</p>
              </div>
            </div>
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors"
            >
              <GitFork className="h-4 w-4" />
              <span>View on GitHub</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="text-gray-300 mb-4">{project.description}</p>

          {/* Help Wanted */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-400 mb-2">Looking for help with:</p>
            <p className="text-[#00FF41]">{project.helpWanted}</p>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 text-sm bg-[#00FF41]/10 text-[#00FF41] rounded-full"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {project.contributionCount || 0} contributions
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(project.createdAt)}
            </div>
          </div>
        </div>

        {/* Submit Contribution Button (if not owner) */}
        {currentUser && !isOwner && project.status === "active" && (
          <div className="mb-8">
            {showContributionForm ? (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Submit Contribution</h2>
                <ContributionForm
                  projectId={projectId}
                  githubRepoOwner={project.githubRepoOwner}
                  githubRepoName={project.githubRepoName}
                  accessToken={currentUser.githubAccessToken || undefined}
                  onSuccess={() => setShowContributionForm(false)}
                  onCancel={() => setShowContributionForm(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowContributionForm(true)}
                className="w-full py-4 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00CC33] transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Submit a Contribution</span>
              </button>
            )}
          </div>
        )}

        {/* Contributions List */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222222]">
            <h2 className="text-lg font-bold text-white">Contributions</h2>
          </div>

          {!contributions ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF41] mx-auto"></div>
            </div>
          ) : contributions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No contributions yet. Be the first to contribute!
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {contributions.map((contribution) => (
                <div key={contribution._id} className="p-4 hover:bg-[#0A0A0A] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {contribution.contributor?.image ? (
                        <img
                          src={contribution.contributor.image}
                          alt={contribution.contributor.name || "Contributor"}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                          <span className="text-[#00FF41] font-bold">
                            {(contribution.contributor?.name ||
                              contribution.contributor?.githubUsername ||
                              "?")[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">
                            {contribution.contributor?.name ||
                              contribution.contributor?.githubUsername}
                          </span>
                          {contribution.contributor?.tier && (
                            <TierBadge tier={contribution.contributor.tier as "builder" | "contributor" | "core" | "architect"} size="sm" showLabel={false} />
                          )}
                        </div>
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
                    </div>
                    <div className="flex items-center space-x-3">
                      {getTypeBadge(contribution.type)}
                      {getStatusBadge(contribution.status)}
                      <span className="text-[#00FF41] font-bold">
                        +{contribution.pointsAwarded}
                      </span>
                    </div>
                  </div>

                  {/* Verify buttons for owner */}
                  {isOwner && contribution.status === "pending" && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleVerify(contribution._id, true)}
                        disabled={verifyingId === contribution._id}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {verifyingId === contribution._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Verify</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleVerify(contribution._id, false)}
                        disabled={verifyingId === contribution._id}
                        className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {verifyingId === contribution._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
