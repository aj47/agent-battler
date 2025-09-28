import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Create a new issue with bounty
 */
export const createIssue = mutation({
  args: {
    githubIssueId: v.number(),
    githubIssueNumber: v.number(),
    repoOwner: v.string(),
    repoName: v.string(),
    title: v.string(),
    description: v.string(),
    githubUrl: v.string(),
    labels: v.array(v.string()),
    bountyAmount: v.number(),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if issue already exists
    const existing = await ctx.db
      .query("issues")
      .withIndex("by_github_issue", (q) => q.eq("githubIssueId", args.githubIssueId))
      .first();

    if (existing) {
      throw new Error("This issue has already been posted to the platform");
    }

    // Create the issue
    const issueId = await ctx.db.insert("issues", {
      githubIssueId: args.githubIssueId,
      githubIssueNumber: args.githubIssueNumber,
      repoOwner: args.repoOwner,
      repoName: args.repoName,
      title: args.title,
      description: args.description,
      githubUrl: args.githubUrl,
      labels: args.labels,
      creatorId: userId,
      bountyAmount: args.bountyAmount,
      status: "open",
      difficulty: args.difficulty,
      viewCount: 0,
      prCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user stats
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, {
        totalBountiesPosted: (user.totalBountiesPosted ?? 0) + 1,
      });
    }

    return issueId;
  },
});

/**
 * Get all issues with optional filters
 */
export const getIssues = query({
  args: {
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),
    minBounty: v.optional(v.number()),
    maxBounty: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("bounty_desc"),
      v.literal("bounty_asc"),
      v.literal("recent"),
      v.literal("oldest")
    )),
  },
  handler: async (ctx, args) => {
    let issues = await ctx.db.query("issues").collect();

    // Apply filters
    if (args.status) {
      issues = issues.filter((i) => i.status === args.status);
    }

    if (args.difficulty) {
      issues = issues.filter((i) => i.difficulty === args.difficulty);
    }

    if (args.minBounty !== undefined) {
      issues = issues.filter((i) => i.bountyAmount >= args.minBounty!);
    }

    if (args.maxBounty !== undefined) {
      issues = issues.filter((i) => i.bountyAmount <= args.maxBounty!);
    }

    // Sort
    const sortBy = args.sortBy || "recent";
    if (sortBy === "bounty_desc") {
      issues.sort((a, b) => b.bountyAmount - a.bountyAmount);
    } else if (sortBy === "bounty_asc") {
      issues.sort((a, b) => a.bountyAmount - b.bountyAmount);
    } else if (sortBy === "recent") {
      issues.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "oldest") {
      issues.sort((a, b) => a.createdAt - b.createdAt);
    }

    // Get creator info for each issue
    const issuesWithCreators = await Promise.all(
      issues.map(async (issue) => {
        const creator = await ctx.db.get(issue.creatorId);
        return {
          ...issue,
          creator: creator ? {
            _id: creator._id,
            name: creator.name,
            githubUsername: creator.githubUsername,
            image: creator.image,
          } : null,
        };
      })
    );

    return issuesWithCreators;
  },
});

/**
 * Get issue by ID
 */
export const getIssueById = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      return null;
    }

    const creator = await ctx.db.get(issue.creatorId);
    
    // Get PRs for this issue
    const prs = await ctx.db
      .query("pullRequests")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();

    return {
      ...issue,
      creator: creator ? {
        _id: creator._id,
        name: creator.name,
        githubUsername: creator.githubUsername,
        image: creator.image,
      } : null,
      pullRequests: prs,
    };
  },
});

/**
 * Get issues created by a user
 */
export const getIssuesByCreator = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issues")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Increment issue view count
 */
export const incrementViewCount = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    await ctx.db.patch(args.issueId, {
      viewCount: issue.viewCount + 1,
    });
  },
});

/**
 * Update issue status
 */
export const updateIssueStatus = mutation({
  args: {
    issueId: v.id("issues"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Only creator can update status
    if (issue.creatorId !== userId) {
      throw new Error("Only the issue creator can update the status");
    }

    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "resolved") {
      updateData.resolvedAt = Date.now();
    }

    await ctx.db.patch(args.issueId, updateData);

    return args.issueId;
  },
});

/**
 * Delete an issue
 */
export const deleteIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Only creator can delete
    if (issue.creatorId !== userId) {
      throw new Error("Only the issue creator can delete this issue");
    }

    // Check if there are any PRs
    const prs = await ctx.db
      .query("pullRequests")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();

    if (prs.length > 0) {
      throw new Error("Cannot delete issue with submitted PRs");
    }

    await ctx.db.delete(args.issueId);

    return { success: true };
  },
});

/**
 * Search issues by text
 */
export const searchIssues = query({
  args: { searchText: v.string() },
  handler: async (ctx, args) => {
    const allIssues = await ctx.db.query("issues").collect();
    
    const searchLower = args.searchText.toLowerCase();
    const filtered = allIssues.filter((issue) => 
      issue.title.toLowerCase().includes(searchLower) ||
      issue.description.toLowerCase().includes(searchLower) ||
      issue.repoName.toLowerCase().includes(searchLower) ||
      issue.labels.some((label) => label.toLowerCase().includes(searchLower))
    );

    return filtered;
  },
});

