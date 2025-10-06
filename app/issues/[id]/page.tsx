"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { CommentSection } from "@/components/CommentSection";
import {
  ArrowLeft,
  ExternalLink,
  DollarSign,
  Clock,
  GitPullRequest,
  Eye,
  Tag,
  User
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as Id<"issues">;
  
  const issue = useQuery(api.issues.getIssueById, { issueId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const incrementView = useMutation(api.issues.incrementViewCount);

  const [showSubmitPR, setShowSubmitPR] = useState(false);

  // Increment view count on mount
  useEffect(() => {
    if (issueId) {
      incrementView({ issueId }).catch(console.error);
    }
  }, [issueId]);

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issue...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isCreator = currentUser?._id === issue.creatorId;
  const canSubmitPR = currentUser && (issue.status === "open" || issue.status === "in_progress");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/issues" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Issues
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Issue Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.replace("_", " ")}
                    </span>
                    {issue.difficulty && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(issue.difficulty)}`}>
                        {issue.difficulty}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{issue.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-medium">
                      {issue.repoOwner}/{issue.repoName}
                    </span>
                    <span>•</span>
                    <span>#{issue.githubIssueNumber}</span>
                    <span>•</span>
                    <a
                      href={issue.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      View on GitHub
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center space-x-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg font-bold text-xl">
                  <DollarSign className="h-6 w-6" />
                  <span>{issue.bountyAmount}</span>
                </div>
              </div>

              {/* Labels */}
              {issue.labels && issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {issue.labels.map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
                <span className="flex items-center">
                  <GitPullRequest className="h-4 w-4 mr-1" />
                  {issue.prCount} PR{issue.prCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {issue.viewCount} views
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Posted {formatDate(issue.createdAt)}
                </span>
              </div>
            </div>

            {/* Submit PR Section */}
            {canSubmitPR && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit a Pull Request</h2>
                <p className="text-gray-600 mb-4">
                  Have you created a PR to solve this issue? Submit it here to compete for the bounty!
                </p>
                <Button
                  onClick={() => router.push(`/issues/${issueId}/submit-pr`)}
                  variant="primary"
                >
                  Submit Pull Request
                </Button>
              </div>
            )}

            {/* Pull Requests */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pull Requests ({issue.pullRequests?.length || 0})
              </h2>

              {!issue.pullRequests || issue.pullRequests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No pull requests submitted yet. Be the first!
                </p>
              ) : (
                <div className="space-y-4">
                  {issue.pullRequests.map((pr) => (
                    <div key={pr._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pr.status === "approved" ? "bg-green-100 text-green-800" :
                              pr.status === "rejected" ? "bg-red-100 text-red-800" :
                              pr.status === "merged" ? "bg-purple-100 text-purple-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {pr.status}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{pr.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{pr.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>#{pr.githubPrNumber}</span>
                            <a
                              href={pr.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-700"
                            >
                              View PR
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <CommentSection
              issueId={issueId}
              currentUserId={currentUser?._id}
              issueCreatorId={issue.creatorId}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Creator Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Posted By</h3>
              <div className="flex items-center space-x-3">
                {issue.creator?.image ? (
                  <img
                    src={issue.creator.image}
                    alt={issue.creator.name || "User"}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {issue.creator?.name || issue.creator?.githubUsername || "Unknown"}
                  </p>
                  {issue.creator?.githubUsername && (
                    <p className="text-sm text-gray-600">@{issue.creator.githubUsername}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions for Creator */}
            {isCreator && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Manage Issue</h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push(`/issues/${issueId}/manage`)}
                  >
                    Review PRs
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

