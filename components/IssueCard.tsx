"use client";

import Link from "next/link";
import { Clock, DollarSign, GitPullRequest, Eye, Tag } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

interface IssueCardProps {
  issue: Doc<"issues"> & {
    creator: {
      _id: any;
      name?: string;
      githubUsername?: string;
      image?: string;
    } | null;
  };
}

export function IssueCard({ issue }: IssueCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
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

  return (
    <Link href={`/issues/${issue._id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
              {issue.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">
                {issue.repoOwner}/{issue.repoName}
              </span>
              <span>•</span>
              <span>#{issue.githubIssueNumber}</span>
            </div>
          </div>
          
          {/* Bounty Badge */}
          <div className="ml-4 flex items-center space-x-1 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>{issue.bountyAmount}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {issue.description}
        </p>

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {issue.labels.slice(0, 3).map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                <Tag className="h-3 w-3 mr-1" />
                {label}
              </span>
            ))}
            {issue.labels.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                +{issue.labels.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Status */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
              {issue.status.replace("_", " ")}
            </span>

            {/* Difficulty */}
            {issue.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(issue.difficulty)}`}>
                {issue.difficulty}
              </span>
            )}

            {/* PR Count */}
            <span className="flex items-center">
              <GitPullRequest className="h-4 w-4 mr-1" />
              {issue.prCount}
            </span>

            {/* View Count */}
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {issue.viewCount}
            </span>
          </div>

          {/* Creator and Date */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {issue.creator?.image && (
              <img
                src={issue.creator.image}
                alt={issue.creator.name || "User"}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(issue.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

