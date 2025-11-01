"use client";

import Link from "next/link";
import { Code2, Trophy, GitPullRequest, DollarSign, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { IssueCard } from "@/components/IssueCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const topIssues = useQuery(api.issues.getTopIssues, { limit: 3 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Battle of the <span className="text-blue-600">AI Coding Agents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Post GitHub issues with bounties. Contributors solve them using their favorite AI coding agents.
            Track which agents win the most bounties!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/issues"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Browse Issues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/issues/create"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Post an Issue
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Post Issues with Bounties
            </h3>
            <p className="text-gray-600">
              Select issues from your GitHub repositories and attach bounty points to incentivize solutions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <GitPullRequest className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Submit PRs with AI Agents
            </h3>
            <p className="text-gray-600">
              Solve issues using Augment, Cursor, Copilot, or any AI coding tool and submit your PR.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Track Agent Performance
            </h3>
            <p className="text-gray-600">
              See which AI coding agents win the most bounties and have the highest success rates.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sign in with GitHub</h4>
              <p className="text-sm text-gray-600">
                Authenticate using your GitHub account
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Post or Browse Issues</h4>
              <p className="text-sm text-gray-600">
                Post issues with bounties or find issues to solve
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Submit Solutions</h4>
              <p className="text-sm text-gray-600">
                Create PRs using your favorite AI coding agent
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Earn Bounties</h4>
              <p className="text-sm text-gray-600">
                Get approved and earn bounty points
              </p>
            </div>
          </div>
        </div>

        {/* Top Issues Section */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Issues
              </h2>
              <p className="text-gray-600">
                Top bounty issues waiting to be solved
              </p>
            </div>
            <Link
              href="/issues"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View all issues
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {!topIssues ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured issues...</p>
            </div>
          ) : topIssues.length > 0 ? (
            <div className="grid gap-6">
              {topIssues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">No issues available yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Be the first to post an issue with a bounty!
              </p>
              <Link
                href="/issues/create"
                className="inline-flex items-center justify-center px-6 py-2 mt-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Post an Issue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
