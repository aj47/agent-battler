"use client";

import { useState } from "react";
import { Search, Filter, Tag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "paused" | "completed" | null>(null);

  const projects = useQuery(api.projects.getProjects, {
    status: selectedStatus ?? undefined,
    tag: selectedTag ?? undefined,
    search: search || undefined,
  });
  const allTags = useQuery(api.projects.getAllTags);

  const statusOptions = [
    { value: null, label: "All" },
    { value: "active" as const, label: "Active" },
    { value: "paused" as const, label: "Paused" },
    { value: "completed" as const, label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Projects</h1>
          <p className="text-gray-400">
            Find projects that need help and start contributing
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex bg-[#0A0A0A] rounded-lg border border-[#222222] p-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedStatus === option.value
                        ? "bg-[#00FF41] text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          {allTags && allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`inline-flex items-center px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTag === null
                    ? "bg-[#00FF41] text-black"
                    : "bg-[#222222] text-gray-400 hover:text-white"
                }`}
              >
                All Tags
              </button>
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`inline-flex items-center px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTag === tag
                      ? "bg-[#00FF41] text-black"
                      : "bg-[#222222] text-gray-400 hover:text-white"
                  }`}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {!projects ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF41] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111111] rounded-xl border border-[#222222]">
            <p className="text-gray-400 text-lg mb-2">No projects found</p>
            <p className="text-gray-500 text-sm">
              {search || selectedTag || selectedStatus
                ? "Try adjusting your filters"
                : "Be the first to submit a project!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
