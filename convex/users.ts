import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get or create user profile
 */
export const getOrCreateUser = mutation({
  args: {
    githubId: v.string(),
    githubUsername: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    githubAccessToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .first();

    if (existingUser) {
      // Update user info
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        image: args.image,
        githubUsername: args.githubUsername,
        githubAccessToken: args.githubAccessToken,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      githubId: args.githubId,
      githubUsername: args.githubUsername,
      name: args.name,
      email: args.email,
      image: args.image,
      githubAccessToken: args.githubAccessToken,
      totalEarnings: 0,
      totalBountiesPosted: 0,
      totalPRsSubmitted: 0,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get current user profile
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Get user by ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by GitHub username
 */
export const getUserByGitHubUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_github_username", (q) => 
        q.eq("githubUsername", args.username)
      )
      .first();
  },
});

/**
 * Update user profile
 */
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(userId, {
      name: args.name,
      email: args.email,
    });

    return userId;
  },
});

/**
 * Get user statistics
 */
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Get issues posted by user
    const issuesPosted = await ctx.db
      .query("issues")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
      .collect();

    // Get PRs submitted by user
    const prsSubmitted = await ctx.db
      .query("pullRequests")
      .withIndex("by_submitter", (q) => q.eq("submitterId", args.userId))
      .collect();

    // Get bounties won
    const bountiesWon = await ctx.db
      .query("bountyTransactions")
      .withIndex("by_to_user", (q) => q.eq("toUserId", args.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Get bounties paid
    const bountiesPaid = await ctx.db
      .query("bountyTransactions")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", args.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    return {
      user,
      stats: {
        issuesPosted: issuesPosted.length,
        issuesResolved: issuesPosted.filter((i) => i.status === "resolved").length,
        prsSubmitted: prsSubmitted.length,
        prsApproved: prsSubmitted.filter((pr) => pr.status === "approved").length,
        prsMerged: prsSubmitted.filter((pr) => pr.status === "merged").length,
        totalEarnings: user.totalEarnings,
        bountiesWon: bountiesWon.length,
        totalBountiesPaid: bountiesPaid.reduce((sum, b) => sum + b.amount, 0),
      },
    };
  },
});

/**
 * Get leaderboard - top earners
 */
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const users = await ctx.db
      .query("users")
      .order("desc")
      .collect();

    // Sort by total earnings
    const sortedUsers = users
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, limit);

    return sortedUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      githubUsername: user.githubUsername,
      image: user.image,
      totalEarnings: user.totalEarnings,
      totalPRsSubmitted: user.totalPRsSubmitted,
    }));
  },
});

/**
 * Update user GitHub access token
 */
export const updateGitHubAccessToken = mutation({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(userId, {
      githubAccessToken: args.accessToken,
    });

    return userId;
  },
});

