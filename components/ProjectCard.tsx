"use client";

import Link from "next/link";
import { GitFork, Tag, Users, ExternalLink } from "lucide-react";
import { TierBadge } from "./TierBadge";
import type { Id } from "@/convex/_generated/dataModel";

interface ProjectOwner {
  _id: Id<"users">;
  name?: string | null;
  githubUsername?: string | null;
  image?: string | null;
}

interface Project {
  _id: Id<"projects">;
  title: string;
  description: string;
  githubRepoUrl: string;
  githubRepoOwner: string;
  githubRepoName: string;
  helpWanted: string;
  tags: string[];
  status: "active" | "paused" | "completed";
  contributionCount?: number;
  owner?: ProjectOwner | null;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
  };

  return (
    <Link href={`/projects/${project._id}`}>
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#00FF41]/50 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {project.owner?.image ? (
              <img
                src={project.owner.image}
                alt={project.owner.name || "Owner"}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                <span className="text-[#00FF41] font-bold">
                  {(project.owner?.name || project.owner?.githubUsername || "?")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#00FF41] transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-gray-400">
                by @{project.owner?.githubUsername || "unknown"}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Help Wanted */}
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 mb-1">Looking for help with:</p>
          <p className="text-sm text-[#00FF41] line-clamp-2">{project.helpWanted}</p>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[#00FF41]/10 text-[#00FF41] rounded-full"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className="text-xs text-gray-400">
                +{project.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400 text-sm">
              <GitFork className="h-4 w-4 mr-1" />
              <span>{project.githubRepoOwner}/{project.githubRepoName}</span>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{project.contributionCount || 0} contributions</span>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#00FF41] transition-colors" />
        </div>
      </div>
    </Link>
  );
}
