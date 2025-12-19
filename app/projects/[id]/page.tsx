"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { ContributionForm } from "@/components/ContributionForm";
import { TierBadge } from "@/components/PointsBadge";
import {
  GitFork,
  ExternalLink,
  Tag,
  Users,
  Clock,
  Check,
  X,
  AlertCircle,
  Plus,
  GitPullRequest,
  MessageSquare,
  Bug,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const currentUser = useQuery(api.users.getCurrentUser);
  const project = useQuery(api.projects.getProjectById, { projectId });
  const submitContribution = useMutation(api.contributions.submitContribution);
  const verifyContribution = useMutation(api.contributions.verifyContribution);

  const [showContributionForm, setShowContributionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const isOwner = currentUser && project && currentUser._id === project.ownerId;

  const handleSubmitContribution = async (data: {
    projectId: Id<"projects">;
    type: "pr_merged" | "feedback_accepted" | "issue_merged";
    githubUrl: string;
  }) => {
    setIsSubmitting(true);
    try {
      await submitContribution(data);
      setShowContributionForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyContribution = async (contributionId: Id<"contributions">, approve: boolean) => {
    setVerifyingId(contributionId);
    try {
      await verifyContribution({ contributionId, approve });
    } finally {
      setVerifyingId(null);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const contributionTypeConfig = {
    pr_merged: { icon: GitPullRequest, label: "Pull Request", color: "text-green-400" },
    feedback_accepted: { icon: MessageSquare, label: "Feedback", color: "text-blue-400" },
    issue_merged: { icon: Bug, label: "Issue Resolved", color: "text-purple-400" },
  };

  const statusColors = {
    pending: "bg-yellow-900/30 border-yellow-600 text-yellow-400",
    verified: "bg-green-900/30 border-green-600 text-green-400",
    rejected: "bg-red-900/30 border-red-600 text-red-400",
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#222222] rounded w-1/3"></div>
            <div className="h-4 bg-[#222222] rounded w-1/2"></div>
            <div className="h-32 bg-[#222222] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const projectStatusColors = {
    active: "bg-green-900/30 border-green-600 text-green-400",
    paused: "bg-yellow-900/30 border-yellow-600 text-yellow-400",
    completed: "bg-gray-800 border-gray-600 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${projectStatusColors[project.status as keyof typeof projectStatusColors]}`}>
                  {project.status}
                </span>
              </div>
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#00FF41] transition-colors"
              >
                <GitFork className="h-4 w-4" />
                {project.githubRepoOwner}/{project.githubRepoName}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            {project.owner && (
              <div className="flex items-center gap-3">
                {(project.owner.image || project.owner.avatar_url) ? (
                  <img
                    src={project.owner.image || project.owner.avatar_url}
                    alt={project.owner.name || "Owner"}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#00FF41]/20 flex items-center justify-center text-[#00FF41] font-bold">
                    {(project.owner.name || project.owner.githubUsername || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{project.owner.name || project.owner.githubUsername}</p>
                  <p className="text-sm text-gray-500">Project Owner</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-gray-300 mb-4">{project.description}</p>

          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-[#00FF41] font-medium mb-2">
              <Users className="h-4 w-4" />
              Help Wanted
            </div>
            <p className="text-gray-300">{project.helpWanted}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a1a1a] text-gray-300 text-sm rounded-md"
              >
                <Tag className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.contributionCount ?? 0} contributions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTimeAgo(project.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {currentUser && !isOwner && project.status === "active" && (
          <div className="mb-6">
            {showContributionForm ? (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Submit Contribution</h2>
                <ContributionForm
                  projectId={projectId}
                  onSubmit={handleSubmitContribution}
                  onCancel={() => setShowContributionForm(false)}
                  isSubmitting={isSubmitting}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowContributionForm(true)}
                className="w-full py-3 px-4 bg-[#00FF41] text-black rounded-lg font-medium hover:bg-[#00FF41]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Submit a Contribution
              </button>
            )}
          </div>
        )}

        {!currentUser && (
          <div className="mb-6 bg-[#111111] border border-[#222222] rounded-xl p-6 text-center">
            <p className="text-gray-400 mb-4">Sign in to contribute to this project</p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center px-6 py-2 bg-[#00FF41] text-black rounded-lg font-medium hover:bg-[#00FF41]/90 transition-colors"
            >
              Sign in with GitHub
            </Link>
          </div>
        )}

        {/* Contributions */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222222]">
            <h2 className="text-lg font-semibold text-white">
              Contributions ({project.contributions?.length ?? 0})
            </h2>
          </div>

          {project.contributions && project.contributions.length > 0 ? (
            <div className="divide-y divide-[#222222]">
              {project.contributions.map((contribution: any) => {
                const config = contributionTypeConfig[contribution.type as keyof typeof contributionTypeConfig];
                const Icon = config.icon;
                const isPending = contribution.status === "pending";
                const isVerifying = verifyingId === contribution._id;

                return (
                  <div key={contribution._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {contribution.contributor && (
                          <>
                            {(contribution.contributor.image || contribution.contributor.avatar_url) ? (
                              <img
                                src={contribution.contributor.image || contribution.contributor.avatar_url}
                                alt={contribution.contributor.name || "Contributor"}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#222222] flex items-center justify-center text-gray-400 font-bold">
                                {(contribution.contributor.name || contribution.contributor.githubUsername || "?")[0].toUpperCase()}
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">
                              {contribution.contributor?.name || contribution.contributor?.githubUsername || "Unknown"}
                            </span>
                            {contribution.contributor?.tier && (
                              <TierBadge tier={contribution.contributor.tier as any} size="sm" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            <span className="text-gray-400">{config.label}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-[#00FF41] font-medium">+{contribution.pointsAwarded} pts</span>
                          </div>
                          <a
                            href={contribution.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-[#00FF41] transition-colors flex items-center gap-1 mt-1"
                          >
                            View on GitHub
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[contribution.status as keyof typeof statusColors]}`}>
                          {contribution.status}
                        </span>

                        {isOwner && isPending && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleVerifyContribution(contribution._id, true)}
                              disabled={isVerifying}
                              className="p-1.5 bg-green-900/30 border border-green-600 text-green-400 rounded hover:bg-green-900/50 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {isVerifying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleVerifyContribution(contribution._id, false)}
                              disabled={isVerifying}
                              className="p-1.5 bg-red-900/30 border border-red-600 text-red-400 rounded hover:bg-red-900/50 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No contributions yet</p>
              <p className="text-sm text-gray-500 mt-1">Be the first to contribute to this project!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
