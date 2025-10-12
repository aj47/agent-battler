import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Development-only helpers for seeding data quickly.
 * NOTE: Do NOT call these in production. They bypass auth checks intentionally
 * to enable local/manual E2E verification without GitHub OAuth.
 */

export const insertUser = mutation({
  args: {
    githubId: v.string(),
    githubUsername: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      githubId: args.githubId,
      githubUsername: args.githubUsername,
      name: args.name,
      email: args.email,
      image: args.image,
      totalEarnings: 0,
      totalBountiesPosted: 0,
      totalPRsSubmitted: 0,
      createdAt: Date.now(),
    });
    return userId;
  },
});

export const insertIssue = mutation({
  args: {
    creatorId: v.id("users"),
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
    const now = Date.now();
    const issueId = await ctx.db.insert("issues", {
      githubIssueId: args.githubIssueId,
      githubIssueNumber: args.githubIssueNumber,
      repoOwner: args.repoOwner,
      repoName: args.repoName,
      title: args.title,
      description: args.description,
      githubUrl: args.githubUrl,
      labels: args.labels,
      creatorId: args.creatorId,
      bountyAmount: args.bountyAmount,
      status: "open",
      difficulty: args.difficulty,
      viewCount: 0,
      prCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return issueId;
  },
});

export const insertPullRequest = mutation({
  args: {
    issueId: v.id("issues"),
    submitterId: v.id("users"),
    githubPrId: v.number(),
    githubPrNumber: v.number(),
    repoOwner: v.string(),
    repoName: v.string(),
    title: v.string(),
    description: v.string(),
    githubUrl: v.string(),
    codingAgentId: v.optional(v.id("codingAgents")),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("merged"),
        v.literal("closed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const prId = await ctx.db.insert("pullRequests", {
      githubPrId: args.githubPrId,
      githubPrNumber: args.githubPrNumber,
      repoOwner: args.repoOwner,
      repoName: args.repoName,
      title: args.title,
      description: args.description,
      githubUrl: args.githubUrl,
      issueId: args.issueId,
      submitterId: args.submitterId,
      codingAgentId: args.codingAgentId,
      status: args.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Bump PR count on issue for parity with normal flow
    const issue = await ctx.db.get(args.issueId);
    if (issue) {
      await ctx.db.patch(args.issueId, {
        prCount: (issue.prCount ?? 0) + 1,
        updatedAt: now,
      });
    }

    return prId;
  },
});



export const approvePullRequestDev = mutation({
  args: {
    prId: v.id("pullRequests"),
  },
  handler: async (ctx, args) => {
    const pr = await ctx.db.get(args.prId);
    if (!pr) throw new Error("PR not found");
    const issue = await ctx.db.get(pr.issueId);
    if (!issue) throw new Error("Issue not found");

    // Update PR status
    await ctx.db.patch(args.prId, {
      status: "approved",
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Resolve issue and set winner
    await ctx.db.patch(pr.issueId, {
      status: "resolved",
      winnerId: pr.submitterId,
      winningPrId: args.prId,
      resolvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Bounty transaction
    await ctx.db.insert("bountyTransactions", {
      issueId: pr.issueId,
      pullRequestId: args.prId,
      fromUserId: issue.creatorId,
      toUserId: pr.submitterId,
      amount: issue.bountyAmount,
      status: "completed",
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    // Update winner earnings
    const winner = await ctx.db.get(pr.submitterId);
    if (winner) {
      await ctx.db.patch(pr.submitterId, {
        totalEarnings: (winner.totalEarnings ?? 0) + (issue.bountyAmount ?? 0),
      });
    }

    return args.prId;
  },
});
