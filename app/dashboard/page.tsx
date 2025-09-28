"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { IssueCard } from "@/components/IssueCard";
import { Trophy, DollarSign, GitPullRequest, FileText } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const userStats = useQuery(
    api.users.getUserStats,
    currentUser ? { userId: currentUser._id } : "skip",
  );
  const myIssues = useQuery(
    api.issues.getIssuesByCreator,
    currentUser ? { userId: currentUser._id } : "skip",
  );
  const myPRs = useQuery(
    api.pullRequests.getPullRequestsBySubmitter,
    currentUser ? { userId: currentUser._id } : "skip",
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to view your dashboard.</p>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {currentUser.name || currentUser.githubUsername}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">{currentUser.totalEarnings}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Issues Posted</p>
                <p className="text-3xl font-bold text-gray-900">{userStats?.stats.issuesPosted || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">PRs Submitted</p>
                <p className="text-3xl font-bold text-gray-900">{userStats?.stats.prsSubmitted || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <GitPullRequest className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bounties Won</p>
                <p className="text-3xl font-bold text-gray-900">{userStats?.stats.bountiesWon || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* My Issues */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Posted Issues</h2>
            <Link
              href="/issues/create"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Post New Issue
            </Link>
          </div>
          
          {!myIssues ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : myIssues.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">You haven&apos;t posted any issues yet.</p>
              <Link
                href="/issues/create"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Post your first issue
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {myIssues.slice(0, 3).map((issue) => (
                <IssueCard key={issue._id} issue={{ ...issue, creator: {
                  _id: currentUser._id,
                  name: currentUser.name,
                  githubUsername: currentUser.githubUsername,
                  image: currentUser.image,
                }}} />
              ))}
            </div>
          )}
        </div>

        {/* My PRs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Submitted PRs</h2>
            <Link
              href="/issues"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse Issues
            </Link>
          </div>
          
          {!myPRs ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : myPRs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">You haven&apos;t submitted any PRs yet.</p>
              <Link
                href="/issues"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Find issues to solve
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {myPRs.slice(0, 5).map((pr) => (
                  <div key={pr._id} className="p-6 hover:bg-gray-50">
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
                          {pr.codingAgent && (
                            <span className="text-xs text-gray-500">
                              using {pr.codingAgent.name}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/issues/${pr.issueId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {pr.title}
                        </Link>
                        {pr.issue && (
                          <p className="text-sm text-gray-600 mt-1">
                            For: {pr.issue.title}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(pr.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

