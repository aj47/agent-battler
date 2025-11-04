"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { IssueCard } from "@/components/IssueCard";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function IssuesPage() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"open" | "in_progress" | "resolved" | "closed" | undefined>(undefined);
  const [difficultyFilter, setDifficultyFilter] = useState<"easy" | "medium" | "hard" | undefined>();
  const [sortBy, setSortBy] = useState<"bounty_desc" | "bounty_asc" | "recent" | "oldest">("bounty_desc");

  const issues = useQuery(api.issues.getIssues, {
    status: statusFilter,
    difficulty: difficultyFilter,
    sortBy,
  });

  const filteredIssues = issues?.filter((issue) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      issue.title.toLowerCase().includes(search) ||
      issue.description.toLowerCase().includes(search) ||
      issue.repoName.toLowerCase().includes(search) ||
      issue.labels.some((label) => label.toLowerCase().includes(search))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Issues</h1>
          <p className="text-gray-600">
            Find issues with bounties and start earning points
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value as any || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={difficultyFilter || ""}
                onChange={(e) => setDifficultyFilter(e.target.value as any || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredIssues?.length || 0} issues found
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bounty_desc">Highest Bounty</option>
                <option value="bounty_asc">Lowest Bounty</option>
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {!issues ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issues...</p>
          </div>
        ) : filteredIssues && filteredIssues.length > 0 ? (
          <div className="grid gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No issues found matching your criteria.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

