"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { Search, Filter, Tag, X } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"active" | "paused" | "completed" | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "contributions">("recent");

  const projects = useQuery(api.projects.getProjects, {
    status: selectedStatus,
    tag: selectedTag,
    sortBy,
    searchText: searchText || undefined,
  });

  const allTags = useQuery(api.projects.getAllTags);

  const clearFilters = () => {
    setSearchText("");
    setSelectedStatus(undefined);
    setSelectedTag(undefined);
    setSortBy("recent");
  };

  const hasFilters = searchText || selectedStatus || selectedTag || sortBy !== "recent";

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Browse Projects</h1>
            <p className="text-gray-400 mt-1">Find projects to contribute to and earn points</p>
          </div>
          <Link
            href="/projects/submit"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
          >
            Submit Your Project
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedStatus || ""}
                onChange={(e) => setSelectedStatus(e.target.value as any || undefined)}
                className="px-4 py-2.5 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#00FF41]"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="contributions">Most Contributions</option>
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {/* Tags */}
          {allTags && allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags:
              </span>
              {allTags.slice(0, 10).map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTag === tag
                      ? "bg-[#00FF41] text-black"
                      : "bg-[#1a1a1a] text-gray-300 hover:bg-[#222222]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {!projects ? (
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-[#222222] rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-[#222222] rounded w-full mb-2"></div>
                <div className="h-4 bg-[#222222] rounded w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-[#222222] rounded w-16"></div>
                  <div className="h-6 bg-[#222222] rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-6">
            {projects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-12 text-center">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No projects found</p>
            <p className="text-sm text-gray-500">
              {hasFilters
                ? "Try adjusting your filters or search query"
                : "Be the first to submit a project!"}
            </p>
            {!hasFilters && (
              <Link
                href="/projects/submit"
                className="inline-flex items-center justify-center px-6 py-2 mt-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
              >
                Submit Your Project
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
