"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LinkIcon, Loader2, Tag, X, Check, AlertCircle } from "lucide-react";

const SUGGESTED_TAGS = [
  "nextjs",
  "react",
  "typescript",
  "javascript",
  "python",
  "ai",
  "ml",
  "web3",
  "mobile",
  "backend",
  "frontend",
  "devtools",
  "database",
  "api",
  "open-source",
];

export default function SubmitProjectPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const submitProject = useMutation(api.projects.submitProject);
  const fetchRepo = useAction(api.github.fetchRepoFromUrl);

  const [repoUrl, setRepoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [helpWanted, setHelpWanted] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{
    name: string;
    description: string;
    topics: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidateRepo = async () => {
    if (!repoUrl || !currentUser?.githubAccessToken) return;

    setIsValidating(true);
    setError(null);
    setRepoInfo(null);

    try {
      const result = await fetchRepo({
        accessToken: currentUser.githubAccessToken,
        repoUrl,
      });

      setRepoInfo({
        name: result.name,
        description: result.description,
        topics: result.topics,
      });

      // Auto-fill fields if empty
      if (!title) setTitle(result.name);
      if (!description && result.description) setDescription(result.description);
      if (tags.length === 0 && result.topics.length > 0) {
        setTags(result.topics.slice(0, 5));
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch repository");
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 10) {
      setTags([...tags, normalizedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || !title || !description || !helpWanted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const projectId = await submitProject({
        githubRepoUrl: repoUrl,
        title,
        description,
        helpWanted,
        tags,
      });
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit project");
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Sign in Required</h1>
          <p className="text-gray-400">Please sign in to submit a project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Submit Your Project</h1>
        <p className="text-gray-400 mb-8">
          Share your GitHub repository with the community and get help from other builders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GitHub Repo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Repository URL *
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    setRepoInfo(null);
                  }}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleValidateRepo}
                disabled={!repoUrl || isValidating}
                className="px-4 py-3 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isValidating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : repoInfo ? (
                  <Check className="h-5 w-5 text-[#00FF41]" />
                ) : (
                  <span>Verify</span>
                )}
              </button>
            </div>
            {repoInfo && (
              <p className="mt-2 text-sm text-[#00FF41]">
                Repository found: {repoInfo.name}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your project about?"
              rows={4}
              className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none resize-none"
              required
            />
          </div>

          {/* Help Wanted */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What help do you need? *
            </label>
            <textarea
              value={helpWanted}
              onChange={(e) => setHelpWanted(e.target.value)}
              placeholder="e.g., Looking for help with frontend design, need code reviews, want feedback on architecture..."
              rows={3}
              className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none resize-none"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (up to 10)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-[#00FF41]/10 text-[#00FF41] rounded-full text-sm"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput || tags.length >= 10}
                className="px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
                .slice(0, 8)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-3 py-1 text-xs bg-[#222222] text-gray-400 rounded-full hover:bg-[#333333] hover:text-white transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !repoUrl || !title || !description || !helpWanted}
            className="w-full py-4 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00CC33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Project</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
