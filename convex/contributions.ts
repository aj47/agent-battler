import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Point values for different contribution types
const POINT_VALUES = {
  pr_merged: 50,
  feedback_accepted: 20,
  issue_merged: 30,
};

/**
 * Submit a contribution to a project
 */
export const submitContribution = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("pr_merged"),
      v.literal("feedback_accepted"),
      v.literal("issue_merged")
    ),
    githubUrl: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
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

    // Can't contribute to your own project
    if (project.ownerId === userId) {
      throw new Error("Cannot submit contributions to your own project");
    }

    // Check if project is active
    if (project.status !== "active") {
      throw new Error("Project is not accepting contributions");
    }

    // Check for duplicate contribution
    const existingContribution = await ctx.db
      .query("contributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), args.projectId),
          q.eq(q.field("githubUrl"), args.githubUrl)
        )
      )
      .first();

    if (existingContribution) {
      throw new Error("You have already submitted this contribution");
    }

    const pointsAwarded = POINT_VALUES[args.type];

    const contributionId = await ctx.db.insert("contributions", {
      contributorId: userId,
      projectId: args.projectId,
      type: args.type,
      githubUrl: args.githubUrl,
      title: args.title,
      description: args.description,
      pointsAwarded,
      status: "pending",
      createdAt: Date.now(),
    });

    // Notify project owner
    await ctx.db.insert("notifications", {
      userId: project.ownerId,
      type: "new_contribution",
      title: "New Contribution",
      message: `Someone submitted a ${args.type.replace("_", " ")} for your project "${project.title}"`,
      relatedProjectId: args.projectId,
      relatedContributionId: contributionId,
      isRead: false,
      createdAt: Date.now(),
    });

    return contributionId;
  },
});

/**
 * Verify a contribution (for project owners)
 */
export const verifyContribution = mutation({
  args: {
    contributionId: v.id("contributions"),
    approved: v.boolean(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const contribution = await ctx.db.get(args.contributionId);
    if (!contribution) {
      throw new Error("Contribution not found");
    }

    const project = await ctx.db.get(contribution.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Only project owner can verify
    if (project.ownerId !== userId) {
      throw new Error("Not authorized to verify this contribution");
    }

    if (contribution.status !== "pending") {
      throw new Error("Contribution has already been reviewed");
    }

    const now = Date.now();

    if (args.approved) {
      // Update contribution status
      await ctx.db.patch(args.contributionId, {
        status: "verified",
        verificationNote: args.note,
        verifiedAt: now,
      });

      // Award points to contributor
      const contributor = await ctx.db.get(contribution.contributorId);
      if (contributor) {
        const currentPoints = contributor.totalPoints || 0;
        const newPoints = currentPoints + contribution.pointsAwarded;

        // Calculate new tier
        let tier: "builder" | "contributor" | "core" | "architect" = "builder";
        if (newPoints >= 1000) tier = "architect";
        else if (newPoints >= 500) tier = "core";
        else if (newPoints >= 100) tier = "contributor";

        const oldTier = contributor.tier || "builder";

        await ctx.db.patch(contribution.contributorId, {
          totalPoints: newPoints,
          tier,
        });

        // Notify about tier upgrade if applicable
        if (tier !== oldTier) {
          await ctx.db.insert("notifications", {
            userId: contribution.contributorId,
            type: "tier_upgrade",
            title: "Tier Upgrade!",
            message: `Congratulations! You've reached ${tier} tier!`,
            isRead: false,
            createdAt: now,
          });
        }
      }

      // Update project contribution count
      await ctx.db.patch(contribution.projectId, {
        contributionCount: (project.contributionCount || 0) + 1,
        updatedAt: now,
      });

      // Notify contributor
      await ctx.db.insert("notifications", {
        userId: contribution.contributorId,
        type: "contribution_verified",
        title: "Contribution Verified!",
        message: `Your contribution to "${project.title}" was verified! You earned ${contribution.pointsAwarded} points.`,
        relatedProjectId: contribution.projectId,
        relatedContributionId: args.contributionId,
        isRead: false,
        createdAt: now,
      });
    } else {
      // Reject contribution
      await ctx.db.patch(args.contributionId, {
        status: "rejected",
        verificationNote: args.note,
        verifiedAt: now,
      });

      // Notify contributor
      await ctx.db.insert("notifications", {
        userId: contribution.contributorId,
        type: "contribution_rejected",
        title: "Contribution Not Accepted",
        message: `Your contribution to "${project.title}" was not accepted. ${args.note ? `Reason: ${args.note}` : ""}`,
        relatedProjectId: contribution.projectId,
        relatedContributionId: args.contributionId,
        isRead: false,
        createdAt: now,
      });
    }

    return args.contributionId;
  },
});

/**
 * Get contributions by the current user
 */
export const getMyContributions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", userId))
      .order("desc")
      .collect();

    // Get project info for each contribution
    const contributionsWithProjects = await Promise.all(
      contributions.map(async (contribution) => {
        const project = await ctx.db.get(contribution.projectId);
        return {
          ...contribution,
          project: project
            ? {
                _id: project._id,
                title: project.title,
                githubRepoOwner: project.githubRepoOwner,
                githubRepoName: project.githubRepoName,
              }
            : null,
        };
      })
    );

    return contributionsWithProjects;
  },
});

/**
 * Get contributions for a specific project
 */
export const getProjectContributions = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))
    ),
  },
  handler: async (ctx, args) => {
    let contributions;

    if (args.status) {
      contributions = await ctx.db
        .query("contributions")
        .withIndex("by_project_status", (q) =>
          q.eq("projectId", args.projectId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      contributions = await ctx.db
        .query("contributions")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .order("desc")
        .collect();
    }

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
                tier: contributor.tier,
              }
            : null,
        };
      })
    );

    return contributionsWithUsers;
  },
});

/**
 * Get top contributors leaderboard
 */
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const users = await ctx.db.query("users").collect();

    // Sort by total points
    const sortedUsers = users
      .filter((u) => (u.totalPoints || 0) > 0)
      .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))
      .slice(0, limit);

    return sortedUsers.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      githubUsername: user.githubUsername,
      image: user.image,
      totalPoints: user.totalPoints || 0,
      tier: user.tier || "builder",
    }));
  },
});

/**
 * Get contribution statistics
 */
export const getContributionStats = query({
  args: {},
  handler: async (ctx) => {
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_status", (q) => q.eq("status", "verified"))
      .collect();

    const totalContributions = contributions.length;
    const totalPointsAwarded = contributions.reduce(
      (sum, c) => sum + c.pointsAwarded,
      0
    );

    const byType = {
      pr_merged: contributions.filter((c) => c.type === "pr_merged").length,
      feedback_accepted: contributions.filter((c) => c.type === "feedback_accepted")
        .length,
      issue_merged: contributions.filter((c) => c.type === "issue_merged").length,
    };

    return {
      totalContributions,
      totalPointsAwarded,
      byType,
    };
  },
});
