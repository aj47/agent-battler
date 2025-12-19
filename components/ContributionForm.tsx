"use client";

import { useState } from "react";
import { GitPullRequest, MessageSquare, Bug, Link as LinkIcon, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ContributionFormProps {
  projectId: Id<"projects">;
  onSubmit: (data: {
    projectId: Id<"projects">;
    type: "pr_merged" | "feedback_accepted" | "issue_merged";
    githubUrl: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const contributionTypes = [
  {
    value: "pr_merged" as const,
    label: "Pull Request",
    description: "A merged pull request",
    points: 50,
    icon: GitPullRequest,
  },
  {
    value: "issue_merged" as const,
    label: "Issue Resolved",
    description: "An issue you helped resolve",
    points: 30,
    icon: Bug,
  },
  {
    value: "feedback_accepted" as const,
    label: "Feedback",
    description: "Accepted feedback or review",
    points: 20,
    icon: MessageSquare,
  },
];

export function ContributionForm({
  projectId,
  onSubmit,
  onCancel,
  isSubmitting,
}: ContributionFormProps) {
  const [type, setType] = useState<"pr_merged" | "feedback_accepted" | "issue_merged">("pr_merged");
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!githubUrl.trim()) {
      setError("Please enter a GitHub URL");
      return;
    }

    if (!githubUrl.includes("github.com")) {
      setError("Please enter a valid GitHub URL");
      return;
    }

    try {
      await onSubmit({
        projectId,
        type,
        githubUrl: githubUrl.trim(),
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit contribution");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Contribution Type
        </label>
        <div className="grid gap-3">
          {contributionTypes.map((option) => {
            const Icon = option.icon;
            const isSelected = type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                  isSelected
                    ? "border-[#00FF41] bg-[#00FF41]/10"
                    : "border-[#333333] bg-[#1a1a1a] hover:border-[#444444]"
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? "bg-[#00FF41]/20" : "bg-[#222222]"}`}>
                  <Icon className={`h-5 w-5 ${isSelected ? "text-[#00FF41]" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${isSelected ? "text-[#00FF41]" : "text-gray-400"}`}>
                    +{option.points}
                  </span>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2">
          GitHub URL
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="url"
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo/pull/123"
            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Paste the link to your pull request, issue, or comment
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-[#1a1a1a] border border-[#333333] text-gray-300 rounded-lg font-medium hover:bg-[#222222] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-[#00FF41] text-black rounded-lg font-medium hover:bg-[#00FF41]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Contribution"
          )}
        </button>
      </div>
    </form>
  );
}
