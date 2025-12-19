"use client";

import { useState } from "react";
import { GitPullRequest, Bug, MessageSquare, LinkIcon, Loader2 } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type ContributionType = "pr_merged" | "feedback_accepted" | "issue_merged";

interface ContributionFormProps {
  projectId: Id<"projects">;
  githubRepoOwner: string;
  githubRepoName: string;
  accessToken?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const POINT_VALUES = {
  pr_merged: 50,
  feedback_accepted: 20,
  issue_merged: 30,
};

const typeConfig = {
  pr_merged: {
    label: "Merged Pull Request",
    description: "A PR that was merged into the project",
    icon: GitPullRequest,
    points: 50,
  },
  feedback_accepted: {
    label: "Accepted Feedback",
    description: "Feedback or suggestions that were implemented",
    icon: MessageSquare,
    points: 20,
  },
  issue_merged: {
    label: "Resolved Issue",
    description: "An issue you created that was addressed",
    icon: Bug,
    points: 30,
  },
};

export function ContributionForm({
  projectId,
  githubRepoOwner,
  githubRepoName,
  accessToken,
  onSuccess,
  onCancel,
}: ContributionFormProps) {
  const [type, setType] = useState<ContributionType>("pr_merged");
  const [githubUrl, setGithubUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    title?: string;
    author?: string;
  } | null>(null);

  const submitContribution = useMutation(api.contributions.submitContribution);
  const validateUrl = useAction(api.github.validateContributionUrl);

  const handleValidateUrl = async () => {
    if (!githubUrl || !accessToken) return;

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const result = await validateUrl({
        accessToken,
        contributionUrl: githubUrl,
        repoOwner: githubRepoOwner,
        repoName: githubRepoName,
      });

      if (result.valid) {
        setValidationResult({
          valid: true,
          title: result.title,
          author: result.author,
        });
        if (result.title && !title) {
          setTitle(result.title);
        }
      } else {
        setError(result.error || "Invalid URL");
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate URL");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitContribution({
        projectId,
        type,
        githubUrl,
        title: title || undefined,
        description: description || undefined,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to submit contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contribution Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Contribution Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(typeConfig) as ContributionType[]).map((key) => {
            const config = typeConfig[key];
            const Icon = config.icon;
            const isSelected = type === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-[#00FF41] bg-[#00FF41]/10"
                    : "border-[#222222] bg-[#111111] hover:border-[#333333]"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon
                    className={`h-5 w-5 ${isSelected ? "text-[#00FF41]" : "text-gray-400"}`}
                  />
                  <span
                    className={`font-medium ${isSelected ? "text-[#00FF41]" : "text-white"}`}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{config.description}</p>
                <p className="text-sm font-bold text-[#00FF41] mt-2">
                  +{config.points} pts
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* GitHub URL */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          GitHub URL
        </label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                setValidationResult(null);
              }}
              placeholder="https://github.com/owner/repo/pull/123"
              className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
              required
            />
          </div>
          {accessToken && (
            <button
              type="button"
              onClick={handleValidateUrl}
              disabled={!githubUrl || isValidating}
              className="px-4 py-3 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Verify"
              )}
            </button>
          )}
        </div>
        {validationResult?.valid && (
          <p className="mt-2 text-sm text-[#00FF41]">
            Valid: {validationResult.title} by @{validationResult.author}
          </p>
        )}
      </div>

      {/* Title (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of your contribution"
          className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
        />
      </div>

      {/* Description (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional context..."
          rows={3}
          className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !githubUrl}
          className="flex-1 py-3 px-4 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00CC33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Contribution (+{POINT_VALUES[type]} pts)</span>
          )}
        </button>
      </div>
    </form>
  );
}
