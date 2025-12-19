"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Link as LinkIcon, Loader2, GitFork, AlertCircle, Check, X, Tag } from "lucide-react";
import Link from "next/link";

export default function SubmitProjectPage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const submitProject = useMutation(api.projects.submitProject);
  const fetchRepoFromUrl = useAction(api.github.fetchRepoFromUrl);

  const [repoUrl, setRepoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [helpWanted, setHelpWanted] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [repoError, setRepoError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFetchRepo = async () => {
    if (!repoUrl.trim() || !currentUser?.githubAccessToken) return;

    setIsLoadingRepo(true);
    setRepoError("");
    setRepoInfo(null);

    try {
      const info = await fetchRepoFromUrl({
        accessToken: currentUser.githubAccessToken,
        repoUrl: repoUrl.trim(),
      });
      setRepoInfo(info);
      setTitle(info.name);
      setDescription(info.description || "");
      if (info.topics && info.topics.length > 0) {
        setTags(info.topics.slice(0, 5));
      }
    } catch (err: any) {
      setRepoError(err.message || "Failed to fetch repository");
    } finally {
      setIsLoadingRepo(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!repoInfo) {
      setError("Please fetch repository info first");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a project title");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a project description");
      return;
    }

    if (!helpWanted.trim()) {
      setError("Please describe what kind of help you need");
      return;
    }

    setIsSubmitting(true);

    try {
      const projectId = await submitProject({
        githubRepoUrl: repoInfo.url,
        githubRepoOwner: repoInfo.owner,
        githubRepoName: repoInfo.name,
        title: title.trim(),
        description: description.trim(),
        helpWanted: helpWanted.trim(),
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
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign in Required</h1>
          <p className="text-gray-400 mb-8">
            You need to sign in with GitHub to submit a project.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
          >
            Sign in with GitHub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Submit Your Project</h1>
          <p className="text-gray-400 mt-2">
            Share your GitHub project with the community and get help from fellow builders
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository URL */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Repository URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                />
              </div>
              <button
                type="button"
                onClick={handleFetchRepo}
                disabled={!repoUrl.trim() || isLoadingRepo}
                className="px-6 py-3 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingRepo ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <GitFork className="h-5 w-5" />
                )}
                Fetch
              </button>
            </div>

            {repoError && (
              <div className="mt-3 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {repoError}
              </div>
            )}

            {repoInfo && (
              <div className="mt-3 p-3 bg-green-900/30 border border-green-600 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                Found: {repoInfo.fullName}
                {repoInfo.isPrivate && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                    Private
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Project Details */}
          {repoInfo && (
            <>
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Awesome Project"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your project does..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="helpWanted" className="block text-sm font-medium text-gray-300 mb-2">
                    What help do you need?
                  </label>
                  <textarea
                    id="helpWanted"
                    value={helpWanted}
                    onChange={(e) => setHelpWanted(e.target.value)}
                    placeholder="e.g., Need help with UI improvements, bug fixes, documentation, testing..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add a tag..."
                        className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 10}
                      className="px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#1a1a1a] text-gray-300 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {tags.length}/10 tags • Press Enter to add
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Link
                  href="/projects"
                  className="flex-1 py-3 px-4 bg-[#1a1a1a] border border-[#333333] text-gray-300 rounded-lg font-medium text-center hover:bg-[#222222] transition-colors"
                >
                  Cancel
                </Link>
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
                    "Submit Project"
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
