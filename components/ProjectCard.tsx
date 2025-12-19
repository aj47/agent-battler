"use client";

import Link from "next/link";
import { ExternalLink, GitFork, Users, Tag } from "lucide-react";
import { PointsBadge } from "./PointsBadge";
import { Id } from "@/convex/_generated/dataModel";

interface ProjectCardProps {
  project: {
    _id: Id<"projects">;
    title: string;
    description: string;
    helpWanted: string;
    githubRepoUrl: string;
    githubRepoOwner: string;
    githubRepoName: string;
    tags: string[];
    status: "active" | "paused" | "completed";
    contributionCount?: number;
    createdAt: number;
    owner?: {
      _id: Id<"users">;
      name?: string;
      githubUsername?: string;
      image?: string;
      avatar_url?: string;
    } | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 hover:border-[#00FF41]/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/projects/${project._id}`}
              className="text-lg font-semibold text-white hover:text-[#00FF41] transition-colors truncate"
            >
              {project.title}
            </Link>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
              {project.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <GitFork className="h-4 w-4" />
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00FF41] transition-colors flex items-center gap-1"
            >
              {project.githubRepoOwner}/{project.githubRepoName}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        {project.owner && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {(project.owner.image || project.owner.avatar_url) ? (
              <img
                src={project.owner.image || project.owner.avatar_url}
                alt={project.owner.name || project.owner.githubUsername || "Owner"}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#00FF41]/20 flex items-center justify-center text-[#00FF41] font-bold text-sm">
                {(project.owner.name || project.owner.githubUsername || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {project.description}
      </p>

      <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#00FF41] font-medium mb-1">
          <Users className="h-3.5 w-3.5" />
          Help Wanted
        </div>
        <p className="text-gray-300 text-sm line-clamp-2">
          {project.helpWanted}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] text-gray-300 text-xs rounded-md"
          >
            <Tag className="h-3 w-3" />
            {tag}
          </span>
        ))}
        {project.tags.length > 4 && (
          <span className="px-2 py-1 bg-[#1a1a1a] text-gray-400 text-xs rounded-md">
            +{project.tags.length - 4} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#222222]">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{project.contributionCount ?? 0} contributions</span>
          <span>{formatTimeAgo(project.createdAt)}</span>
        </div>
        <Link
          href={`/projects/${project._id}`}
          className="px-4 py-2 bg-[#00FF41] text-black text-sm font-medium rounded-lg hover:bg-[#00FF41]/90 transition-colors"
        >
          View Project
        </Link>
      </div>
    </div>
  );
}
