import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Submit a new project to the platform
 */
export const submitProject = mutation({
  args: {
    githubRepoUrl: v.string(),
    githubRepoOwner: v.string(),
    githubRepoName: v.string(),
    title: v.string(),
    description: v.string(),
    helpWanted: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if project already exists
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_repo", (q) =>
        q.eq("githubRepoOwner", args.githubRepoOwner).eq("githubRepoName", args.githubRepoName)
      )
      .first();

    if (existing) {
      throw new Error("This repository has already been submitted to the platform");
    }

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      ownerId: userId,
      githubRepoUrl: args.githubRepoUrl,
      githubRepoOwner: args.githubRepoOwner,
      githubRepoName: args.githubRepoName,
      title: args.title,
      description: args.description,
      helpWanted: args.helpWanted,
      tags: args.tags,
      status: "active",
      contributionCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

/**
 * Get all projects with optional filters
 */
export const getProjects = query({
  args: {
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("completed"))
    ),
    tag: v.optional(v.string()),
    sortBy: v.optional(
      v.union(v.literal("recent"), v.literal("oldest"), v.literal("contributions"))
    ),
    searchText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("projects").collect();

    // Apply status filter
    if (args.status) {
      projects = projects.filter((p) => p.status === args.status);
    }

    // Apply tag filter
    if (args.tag) {
      const tagLower = args.tag.toLowerCase();
      projects = projects.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === tagLower)
      );
    }

    // Apply search filter
    if (args.searchText) {
      const searchLower = args.searchText.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.githubRepoName.toLowerCase().includes(searchLower) ||
          p.helpWanted.toLowerCase().includes(searchLower) ||
          p.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    const sortBy = args.sortBy || "recent";
    if (sortBy === "recent") {
      projects.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "oldest") {
      projects.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === "contributions") {
      projects.sort((a, b) => (b.contributionCount ?? 0) - (a.contributionCount ?? 0));
    }

    // Get owner info for each project
    const projectsWithOwners = await Promise.all(
      projects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);
        return {
          ...project,
          owner: owner
            ? {
                _id: owner._id,
                name: owner.name,
                githubUsername: owner.githubUsername,
                image: owner.image,
                avatar_url: owner.avatar_url,
              }
            : null,
        };
      })
    );

    return projectsWithOwners;
  },
});

/**
 * Get project by ID
 */
export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    const owner = await ctx.db.get(project.ownerId);

    // Get contributions for this project
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Enrich contributions with contributor info
    const contributionsWithUsers = await Promise.all(
      contributions.map(async (contribution) => {
        const contributor = await ctx.db.get(contribution.contributorId);
        return {
          ...contribution,
          contributor: contributor
            ? {
                _id: contributor._id,
                name: contributor.name,
                githubUsername: contributor.githubUsername,
                image: contributor.image,
                avatar_url: contributor.avatar_url,
              }
            : null,
        };
      })
    );

    return {
      ...project,
      owner: owner
        ? {
            _id: owner._id,
            name: owner.name,
            githubUsername: owner.githubUsername,
            image: owner.image,
            avatar_url: owner.avatar_url,
          }
        : null,
      contributions: contributionsWithUsers,
    };
  },
});

/**
 * Get projects owned by the current user
 */
export const getMyProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();

    return projects;
  },
});

/**
 * Get projects by a specific user
 */
export const getProjectsByOwner = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Update a project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    helpWanted: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Only owner can update
    if (project.ownerId !== userId) {
      throw new Error("Only the project owner can update this project");
    }

    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.helpWanted !== undefined) updateData.helpWanted = args.helpWanted;
    if (args.tags !== undefined) updateData.tags = args.tags;

    await ctx.db.patch(args.projectId, updateData);

    return args.projectId;
  },
});

/**
 * Pause or unpause a project
 */
export const toggleProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== userId) {
      throw new Error("Only the project owner can change the status");
    }

    await ctx.db.patch(args.projectId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

/**
 * Delete a project
 */
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== userId) {
      throw new Error("Only the project owner can delete this project");
    }

    // Check if there are any contributions
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (contributions.length > 0) {
      throw new Error("Cannot delete project with contributions");
    }

    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});

/**
 * Get featured projects for homepage
 * Shows active projects, sorted by recent activity
 */
export const getFeaturedProjects = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;

    // Get active projects
    let projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Sort by creation date (most recent first)
    projects.sort((a, b) => b.createdAt - a.createdAt);

    // Take top N projects
    const topProjects = projects.slice(0, limit);

    // Enrich with owner information
    const enrichedProjects = await Promise.all(
      topProjects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);
        return {
          ...project,
          owner: owner
            ? {
                _id: owner._id,
                name: owner.name,
                githubUsername: owner.githubUsername,
                image: owner.image,
                avatar_url: owner.avatar_url,
              }
            : null,
        };
      })
    );

    return enrichedProjects;
  },
});

/**
 * Get all unique tags from projects
 */
export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const tagSet = new Set<string>();

    projects.forEach((project) => {
      project.tags.forEach((tag) => tagSet.add(tag.toLowerCase()));
    });

    return Array.from(tagSet).sort();
  },
});
