"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SubmitPRPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as Id<"issues">;
  
  const issue = useQuery(api.issues.getIssueById, { issueId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const codingAgents = useQuery(api.codingAgents.getAllCodingAgents);
  
  const submitPR = useMutation(api.pullRequests.submitPullRequest);

  const [prNumber, setPrNumber] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"codingAgents"> | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!issue || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Parse PR URL to extract owner, repo, and PR number
      const prUrlPattern = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
      const match = prUrl.match(prUrlPattern);

      if (!match) {
        throw new Error("Invalid GitHub PR URL. Please use format: https://github.com/owner/repo/pull/123");
      }

      const [, owner, repo, prNum] = match;
      const prNumberInt = parseInt(prNum);

      // For now, we'll use dummy data for PR details
      // In a real app, you'd fetch this from GitHub API
      await submitPR({
        issueId,
        githubPrId: Date.now(), // Temporary - should fetch from GitHub
        githubPrNumber: prNumberInt,
        repoOwner: owner,
        repoName: repo,
        title: `PR #${prNumberInt}`, // Should fetch from GitHub
        description: "Pull request submitted via Agent Battler",
        githubUrl: prUrl,
        codingAgentId: selectedAgentId,
      });

      router.push(`/issues/${issueId}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit PR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href={`/issues/${issueId}`} 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issue
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Pull Request</h1>
          <p className="text-gray-600">
            Link your GitHub PR to this issue and specify which AI coding agent you used
          </p>
        </div>

        {/* Issue Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Issue: {issue.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{issue.repoOwner}/{issue.repoName}</span>
            <span>•</span>
            <span>Bounty: {issue.bountyAmount} points</span>
            <span>•</span>
            <a
              href={issue.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              View Issue
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* PR URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Pull Request URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              Make sure your PR references this issue (e.g., "Fixes #{issue.githubIssueNumber}")
            </p>
          </div>

          {/* Coding Agent Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which AI Coding Agent did you use? *
            </label>
            <select
              required
              value={selectedAgentId || ""}
              onChange={(e) => setSelectedAgentId(e.target.value as Id<"codingAgents">)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an agent...</option>
              {codingAgents?.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Help us track which AI coding agents are most successful!
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Before submitting:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Make sure your PR is created on GitHub</li>
              <li>Reference the issue number in your PR description</li>
              <li>Ensure your code follows the repository's guidelines</li>
              <li>Test your changes thoroughly</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/issues/${issueId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!prUrl || !selectedAgentId}
            >
              Submit Pull Request
            </Button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Your PR will be visible on the issue page</li>
            <li>The issue creator will review your PR</li>
            <li>If approved, you'll earn the bounty points</li>
            <li>Your chosen AI agent's stats will be updated</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

