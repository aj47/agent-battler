import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Submit a pull request for an issue
 */
export const submitPullRequest = mutation({
  args: {
    issueId: v.id("issues"),
    githubPrId: v.number(),
    githubPrNumber: v.number(),
    repoOwner: v.string(),
    repoName: v.string(),
    title: v.string(),
    description: v.string(),
    githubUrl: v.string(),
    codingAgentId: v.optional(v.id("codingAgents")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify issue exists
    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Check if issue is still open
    if (issue.status === "resolved" || issue.status === "closed") {
      throw new Error("This issue is no longer accepting PRs");
    }

    // Check if user already submitted a PR for this issue
    const existingPR = await ctx.db
      .query("pullRequests")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .filter((q) => q.eq(q.field("submitterId"), userId))
      .first();

    if (existingPR) {
      throw new Error("You have already submitted a PR for this issue");
    }

    // Check if this GitHub PR was already submitted
    const existingGitHubPR = await ctx.db
      .query("pullRequests")
      .withIndex("by_github_pr", (q) => q.eq("githubPrId", args.githubPrId))
      .first();

    if (existingGitHubPR) {
      throw new Error("This GitHub PR has already been submitted");
    }

    // Create the PR
    const prId = await ctx.db.insert("pullRequests", {
      githubPrId: args.githubPrId,
      githubPrNumber: args.githubPrNumber,
      repoOwner: args.repoOwner,
      repoName: args.repoName,
      title: args.title,
      description: args.description,
      githubUrl: args.githubUrl,
      issueId: args.issueId,
      submitterId: userId,
      codingAgentId: args.codingAgentId,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update issue PR count and status
    await ctx.db.patch(args.issueId, {
      prCount: issue.prCount + 1,
      status: "in_progress",
      updatedAt: Date.now(),
    });

    // Update user stats
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, {
        totalPRsSubmitted: user.totalPRsSubmitted + 1,
      });
    }

    // Create notification for issue creator
    if (issue.creatorId !== userId) {
      await ctx.db.insert("notifications", {
        userId: issue.creatorId,
        type: "new_pr",
        title: "New PR Submitted",
        message: `A new PR has been submitted for your issue: ${issue.title}`,
        relatedIssueId: args.issueId,
        relatedPrId: prId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return prId;
  },
});

/**
 * Get PR by ID
 */
export const getPullRequestById = query({
  args: { prId: v.id("pullRequests") },
  handler: async (ctx, args) => {
    const pr = await ctx.db.get(args.prId);
    if (!pr) {
      return null;
    }

    const submitter = await ctx.db.get(pr.submitterId);
    const issue = await ctx.db.get(pr.issueId);
    const codingAgent = pr.codingAgentId 
      ? await ctx.db.get(pr.codingAgentId)
      : null;

    return {
      ...pr,
      submitter: submitter ? {
        _id: submitter._id,
        name: submitter.name,
        githubUsername: submitter.githubUsername,
        image: submitter.image,
      } : null,
      issue,
      codingAgent,
    };
  },
});

/**
 * Get PRs for an issue
 */
export const getPullRequestsByIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const prs = await ctx.db
      .query("pullRequests")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();

    // Get submitter and coding agent info
    const prsWithDetails = await Promise.all(
      prs.map(async (pr) => {
        const submitter = await ctx.db.get(pr.submitterId);
        const codingAgent = pr.codingAgentId 
          ? await ctx.db.get(pr.codingAgentId)
          : null;

        return {
          ...pr,
          submitter: submitter ? {
            _id: submitter._id,
            name: submitter.name,
            githubUsername: submitter.githubUsername,
            image: submitter.image,
          } : null,
          codingAgent,
        };
      })
    );

    return prsWithDetails;
  },
});

/**
 * Get PRs submitted by a user
 */
export const getPullRequestsBySubmitter = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const prs = await ctx.db
      .query("pullRequests")
      .withIndex("by_submitter", (q) => q.eq("submitterId", args.userId))
      .order("desc")
      .collect();

    // Get issue and coding agent info
    const prsWithDetails = await Promise.all(
      prs.map(async (pr) => {
        const issue = await ctx.db.get(pr.issueId);
        const codingAgent = pr.codingAgentId 
          ? await ctx.db.get(pr.codingAgentId)
          : null;

        return {
          ...pr,
          issue,
          codingAgent,
        };
      })
    );

    return prsWithDetails;
  },
});

/**
 * Review a PR (approve/reject)
 */
export const reviewPullRequest = mutation({
  args: {
    prId: v.id("pullRequests"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    feedback: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const pr = await ctx.db.get(args.prId);
    if (!pr) {
      throw new Error("Pull request not found");
    }

    const issue = await ctx.db.get(pr.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Only issue creator can review
    if (issue.creatorId !== userId) {
      throw new Error("Only the issue creator can review PRs");
    }

    // Update PR
    await ctx.db.patch(args.prId, {
      status: args.status,
      feedback: args.feedback,
      rating: args.rating,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // If approved, mark issue as resolved and create bounty transaction
    if (args.status === "approved") {
      await ctx.db.patch(pr.issueId, {
        status: "resolved",
        winnerId: pr.submitterId,
        winningPrId: args.prId,
        resolvedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create bounty transaction
      await ctx.db.insert("bountyTransactions", {
        issueId: pr.issueId,
        pullRequestId: args.prId,
        fromUserId: userId,
        toUserId: pr.submitterId,
        amount: issue.bountyAmount,
        status: "completed",
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      // Update winner's earnings
      const winner = await ctx.db.get(pr.submitterId);
      if (winner) {
        await ctx.db.patch(pr.submitterId, {
          totalEarnings: winner.totalEarnings + issue.bountyAmount,
        });
      }

      // Create notification for PR submitter
      await ctx.db.insert("notifications", {
        userId: pr.submitterId,
        type: "pr_approved",
        title: "PR Approved! 🎉",
        message: `Your PR has been approved and you won ${issue.bountyAmount} points!`,
        relatedIssueId: pr.issueId,
        relatedPrId: args.prId,
        isRead: false,
        createdAt: Date.now(),
      });
    } else {
      // Create notification for rejection
      await ctx.db.insert("notifications", {
        userId: pr.submitterId,
        type: "pr_rejected",
        title: "PR Rejected",
        message: `Your PR has been rejected. ${args.feedback || ""}`,
        relatedIssueId: pr.issueId,
        relatedPrId: args.prId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return args.prId;
  },
});

/**
 * Update PR status (for tracking GitHub merge status)
 */
export const updatePullRequestStatus = mutation({
  args: {
    prId: v.id("pullRequests"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("merged"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const pr = await ctx.db.get(args.prId);
    if (!pr) {
      throw new Error("Pull request not found");
    }

    await ctx.db.patch(args.prId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.prId;
  },
});

