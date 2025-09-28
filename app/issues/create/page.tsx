"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { ArrowLeft, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CreateIssuePage() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const [step, setStep] = useState<"select-repo" | "select-issue" | "set-bounty">("select-repo");
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [bountyAmount, setBountyAmount] = useState(100);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actions to fetch from GitHub
  const fetchRepos = useAction(api.github.fetchUserRepositories);
  const fetchIssues = useAction(api.github.fetchRepositoryIssues);
  
  // Mutation to create issue
  const createIssue = useMutation(api.issues.createIssue);

  const [repos, setRepos] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [repoSearch, setRepoSearch] = useState("");
  const [issueSearch, setIssueSearch] = useState("");

  // Load repositories
  const loadRepositories = async () => {
    if (!currentUser?.githubAccessToken) {
      setError("GitHub access token not found. Please sign in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const repoData = await fetchRepos({ accessToken: currentUser.githubAccessToken });
      setRepos(repoData);
    } catch (err: any) {
      setError(err.message || "Failed to load repositories");
    } finally {
      setIsLoading(false);
    }
  };

  // Load issues for selected repo
  const loadIssues = async (repo: any) => {
    if (!currentUser?.githubAccessToken) {
      setError("GitHub access token not found. Please sign in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const issueData = await fetchIssues({
        accessToken: currentUser.githubAccessToken,
        owner: repo.owner,
        repo: repo.name,
        state: "open",
      });
      setIssues(issueData);
      setSelectedRepo(repo);
      setStep("select-issue");
    } catch (err: any) {
      setError(err.message || "Failed to load issues");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle issue selection
  const handleIssueSelect = (issue: any) => {
    setSelectedIssue(issue);
    setStep("set-bounty");
  };

  // Submit the issue
  const handleSubmit = async () => {
    if (!selectedIssue || !selectedRepo) return;

    setIsLoading(true);
    setError(null);
    try {
      const issueId = await createIssue({
        githubIssueId: selectedIssue.id,
        githubIssueNumber: selectedIssue.number,
        repoOwner: selectedRepo.owner,
        repoName: selectedRepo.name,
        title: selectedIssue.title,
        description: selectedIssue.body,
        githubUrl: selectedIssue.url,
        labels: selectedIssue.labels,
        bountyAmount,
        difficulty,
      });

      router.push(`/issues/${issueId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create issue");
    } finally {
      setIsLoading(false);
    }
  };

  // Load repos on mount
  if (step === "select-repo" && repos.length === 0 && !isLoading && currentUser) {
    loadRepositories();
  }

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(repoSearch.toLowerCase())
  );

  const filteredIssues = issues.filter((issue) =>
    issue.title.toLowerCase().includes(issueSearch.toLowerCase()) ||
    issue.body.toLowerCase().includes(issueSearch.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to post issues.</p>
            <Link href="/auth/signin" className="text-blue-600 hover:underline mt-2 inline-block">
              Sign in with GitHub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/issues" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post an Issue</h1>
          <p className="text-gray-600">
            Select an issue from your GitHub repositories and set a bounty
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step === "select-repo" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "select-repo" ? "bg-blue-600 text-white" : "bg-gray-300"}`}>
                1
              </div>
              <span className="ml-2 font-medium">Select Repository</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${step === "select-issue" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "select-issue" ? "bg-blue-600 text-white" : "bg-gray-300"}`}>
                2
              </div>
              <span className="ml-2 font-medium">Select Issue</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${step === "set-bounty" ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "set-bounty" ? "bg-blue-600 text-white" : "bg-gray-300"}`}>
                3
              </div>
              <span className="ml-2 font-medium">Set Bounty</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Select Repository */}
        {step === "select-repo" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Repository</h2>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading repositories...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => loadIssues(repo)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{repo.fullName}</h3>
                        {repo.description && (
                          <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          {repo.language && <span>{repo.language}</span>}
                          <span>⭐ {repo.stargazersCount}</span>
                          <span>Issues: {repo.openIssuesCount}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Issue */}
        {step === "select-issue" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Select an Issue from {selectedRepo?.fullName}
              </h2>
              <button
                onClick={() => {
                  setStep("select-repo");
                  setSelectedRepo(null);
                  setIssues([]);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Change Repository
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No open issues found in this repository.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => handleIssueSelect(issue)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-gray-500">#{issue.number}</span>
                          <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                        </div>
                        {issue.body && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{issue.body}</p>
                        )}
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {issue.labels.slice(0, 3).map((label: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Set Bounty */}
        {step === "set-bounty" && selectedIssue && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Set Bounty Amount</h2>
              <button
                onClick={() => {
                  setStep("select-issue");
                  setSelectedIssue(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Change Issue
              </button>
            </div>

            {/* Selected Issue Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">
                  {selectedRepo?.fullName} #{selectedIssue.number}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{selectedIssue.title}</h3>
              {selectedIssue.body && (
                <p className="text-sm text-gray-600 line-clamp-3">{selectedIssue.body}</p>
              )}
              <a
                href={selectedIssue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                View on GitHub
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            {/* Bounty Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bounty Amount (points)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={bountyAmount}
                onChange={(e) => setBountyAmount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Suggested: 50-100 for easy, 100-300 for medium, 300+ for hard issues
              </p>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setDifficulty("easy")}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    difficulty === "easy"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">Easy</div>
                  <div className="text-sm text-gray-600 mt-1">Quick fixes</div>
                </button>
                <button
                  onClick={() => setDifficulty("medium")}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    difficulty === "medium"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">Medium</div>
                  <div className="text-sm text-gray-600 mt-1">Moderate work</div>
                </button>
                <button
                  onClick={() => setDifficulty("hard")}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    difficulty === "hard"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">Hard</div>
                  <div className="text-sm text-gray-600 mt-1">Complex task</div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => router.push("/issues")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={bountyAmount < 10}
              >
                Post Issue with {bountyAmount} Points Bounty
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

