import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Submit a new project to the platform
 */
export const submitProject = mutation({
  args: {
    githubRepoUrl: v.string(),
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

    // Parse GitHub URL to extract owner and repo name
    const urlMatch = args.githubRepoUrl.match(
      /github\.com\/([^\/]+)\/([^\/]+)/
    );
    if (!urlMatch) {
      throw new Error("Invalid GitHub repository URL");
    }

    const [, githubRepoOwner, githubRepoName] = urlMatch;
    const cleanRepoName = githubRepoName.replace(/\.git$/, "");

    // Check if project already exists
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_repo", (q) =>
        q.eq("githubRepoOwner", githubRepoOwner).eq("githubRepoName", cleanRepoName)
      )
      .first();

    if (existingProject) {
      throw new Error("This repository has already been submitted");
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      ownerId: userId,
      githubRepoUrl: args.githubRepoUrl,
      githubRepoOwner: githubRepoOwner,
      githubRepoName: cleanRepoName,
      title: args.title,
      description: args.description,
      helpWanted: args.helpWanted,
      tags: args.tags,
      status: "active",
      contributionCount: 0,
      createdAt: now,
      updatedAt: now,
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
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let projects;

    if (args.status) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    } else {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_created_at")
        .order("desc")
        .take(limit);
    }

    // Filter by tag if provided
    if (args.tag) {
      projects = projects.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === args.tag!.toLowerCase())
      );
    }

    // Filter by search term if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.githubRepoName.toLowerCase().includes(searchLower)
      );
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
              }
            : null,
        };
      })
    );

    return projectsWithOwners;
  },
});

/**
 * Get featured projects for homepage
 */
export const getFeaturedProjects = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(limit);

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
      .order("desc")
      .take(50);

    // Get contributor info
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
          }
        : null,
      contributions: contributionsWithUsers,
    };
  },
});

/**
 * Get projects by the current user
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
 * Update project details
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    helpWanted: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("active"), v.literal("paused"), v.literal("completed"))
    ),
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
      throw new Error("Not authorized to update this project");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.helpWanted !== undefined) updates.helpWanted = args.helpWanted;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.projectId, updates);

    return args.projectId;
  },
});

/**
 * Pause a project
 */
export const pauseProject = mutation({
  args: {
    projectId: v.id("projects"),
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
      throw new Error("Not authorized to pause this project");
    }

    await ctx.db.patch(args.projectId, {
      status: "paused",
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

/**
 * Delete a project (only if no verified contributions)
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
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
      throw new Error("Not authorized to delete this project");
    }

    // Check for verified contributions
    const verifiedContributions = await ctx.db
      .query("contributions")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "verified")
      )
      .first();

    if (verifiedContributions) {
      throw new Error("Cannot delete project with verified contributions");
    }

    // Delete pending contributions
    const pendingContributions = await ctx.db
      .query("contributions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const contribution of pendingContributions) {
      await ctx.db.delete(contribution._id);
    }

    // Delete comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.projectId);

    return args.projectId;
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

    for (const project of projects) {
      for (const tag of project.tags) {
        tagSet.add(tag.toLowerCase());
      }
    }

    return Array.from(tagSet).sort();
  },
});
