import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

// Point values for different contribution types
export const POINT_VALUES = {
  pr_merged: 50,
  feedback_accepted: 20,
  issue_merged: 30,
} as const;

// Tier thresholds
export const TIER_THRESHOLDS = {
  builder: 0,
  contributor: 100,
  core: 500,
  architect: 1000,
} as const;

/**
 * Calculate user tier based on points
 */
export function calculateTier(
  points: number
): "builder" | "contributor" | "core" | "architect" {
  if (points >= TIER_THRESHOLDS.architect) return "architect";
  if (points >= TIER_THRESHOLDS.core) return "core";
  if (points >= TIER_THRESHOLDS.contributor) return "contributor";
  return "builder";
}

/**
 * Submit a contribution for review
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
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Cannot submit contribution to your own project
    if (project.ownerId === userId) {
      throw new Error("Cannot submit contribution to your own project");
    }

    // Check if project is active
    if (project.status !== "active") {
      throw new Error("Project is not accepting contributions");
    }

    // Check for duplicate contribution
    const existing = await ctx.db
      .query("contributions")
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), args.projectId),
          q.eq(q.field("githubUrl"), args.githubUrl)
        )
      )
      .first();

    if (existing) {
      throw new Error("This contribution has already been submitted");
    }

    // Get points for this contribution type
    const pointsAwarded = POINT_VALUES[args.type];

    // Create the contribution
    const contributionId = await ctx.db.insert("contributions", {
      contributorId: userId,
      projectId: args.projectId,
      type: args.type,
      githubUrl: args.githubUrl,
      pointsAwarded,
      status: "pending",
      createdAt: Date.now(),
    });

    // Create notification for project owner
    await ctx.db.insert("notifications", {
      userId: project.ownerId,
      type: "new_contribution",
      title: "New Contribution",
      message: `Someone submitted a ${args.type.replace("_", " ")} to your project "${project.title}"`,
      relatedProjectId: args.projectId,
      relatedContributionId: contributionId,
      isRead: false,
      createdAt: Date.now(),
    });

    return contributionId;
  },
});

/**
 * Verify a contribution (project owner only)
 */
export const verifyContribution = mutation({
  args: {
    contributionId: v.id("contributions"),
    approve: v.boolean(),
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

    // Get the project
    const project = await ctx.db.get(contribution.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Only project owner can verify
    if (project.ownerId !== userId) {
      throw new Error("Only the project owner can verify contributions");
    }

    // Can only verify pending contributions
    if (contribution.status !== "pending") {
      throw new Error("Contribution has already been reviewed");
    }

    const newStatus = args.approve ? "verified" : "rejected";

    // Update contribution status
    await ctx.db.patch(args.contributionId, {
      status: newStatus,
      verifiedAt: Date.now(),
    });

    if (args.approve) {
      // Award points to contributor
      const contributor = await ctx.db.get(contribution.contributorId);
      if (contributor) {
        const newTotalPoints =
          (contributor.totalPoints ?? 0) + contribution.pointsAwarded;
        const newTier = calculateTier(newTotalPoints);

        await ctx.db.patch(contribution.contributorId, {
          totalPoints: newTotalPoints,
          tier: newTier,
        });
      }

      // Update project contribution count
      await ctx.db.patch(contribution.projectId, {
        contributionCount: (project.contributionCount ?? 0) + 1,
        updatedAt: Date.now(),
      });

      // Notify contributor
      await ctx.db.insert("notifications", {
        userId: contribution.contributorId,
        type: "contribution_verified",
        title: "Contribution Verified!",
        message: `Your contribution to "${project.title}" was verified. You earned ${contribution.pointsAwarded} points!`,
        relatedProjectId: contribution.projectId,
        relatedContributionId: args.contributionId,
        isRead: false,
        createdAt: Date.now(),
      });
    } else {
      // Notify contributor of rejection
      await ctx.db.insert("notifications", {
        userId: contribution.contributorId,
        type: "contribution_rejected",
        title: "Contribution Not Accepted",
        message: `Your contribution to "${project.title}" was not accepted.`,
        relatedProjectId: contribution.projectId,
        relatedContributionId: args.contributionId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return args.contributionId;
  },
});

/**
 * Get contributions by the current user
 */
export const getMyContributions = query({
  args: {
    status: v.optional(
      v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    let contributions = await ctx.db
      .query("contributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", userId))
      .order("desc")
      .collect();

    if (args.status) {
      contributions = contributions.filter((c) => c.status === args.status);
    }

    // Enrich with project info
    const enrichedContributions = await Promise.all(
      contributions.map(async (contribution) => {
        const project = await ctx.db.get(contribution.projectId);
        return {
          ...contribution,
          project: project
            ? {
                _id: project._id,
                title: project.title,
                githubRepoName: project.githubRepoName,
                githubRepoOwner: project.githubRepoOwner,
              }
            : null,
        };
      })
    );

    return enrichedContributions;
  },
});

/**
 * Get contributions for a project
 */
export const getProjectContributions = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"))
    ),
  },
  handler: async (ctx, args) => {
    let contributions = await ctx.db
      .query("contributions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    if (args.status) {
      contributions = contributions.filter((c) => c.status === args.status);
    }

    // Enrich with contributor info
    const enrichedContributions = await Promise.all(
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
                tier: contributor.tier,
              }
            : null,
        };
      })
    );

    return enrichedContributions;
  },
});

/**
 * Get leaderboard - top contributors by points
 */
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    period: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const period = args.period ?? "all";

    // Get time filter
    const now = Date.now();
    let timeFilter: number | null = null;
    if (period === "week") {
      timeFilter = now - 7 * 24 * 60 * 60 * 1000;
    } else if (period === "month") {
      timeFilter = now - 30 * 24 * 60 * 60 * 1000;
    }

    if (period === "all") {
      // For all-time, just get users sorted by totalPoints
      const users = await ctx.db.query("users").collect();

      const sortedUsers = users
        .filter((u) => (u.totalPoints ?? 0) > 0)
        .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))
        .slice(0, limit);

      return sortedUsers.map((user, index) => ({
        rank: index + 1,
        _id: user._id,
        name: user.name,
        githubUsername: user.githubUsername,
        image: user.image,
        avatar_url: user.avatar_url,
        totalPoints: user.totalPoints ?? 0,
        tier: user.tier ?? "builder",
      }));
    } else {
      // For time-filtered, calculate points from contributions
      const contributions = await ctx.db
        .query("contributions")
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "verified"),
            q.gte(q.field("verifiedAt"), timeFilter!)
          )
        )
        .collect();

      // Group by contributor and sum points
      const pointsByUser = new Map<Id<"users">, number>();
      contributions.forEach((c) => {
        const currentPoints = pointsByUser.get(c.contributorId) ?? 0;
        pointsByUser.set(c.contributorId, currentPoints + c.pointsAwarded);
      });

      // Sort and limit
      const sortedEntries = Array.from(pointsByUser.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      // Fetch user info
      const leaderboard = await Promise.all(
        sortedEntries.map(async ([contributorId, points], index) => {
          const user = await ctx.db.get(contributorId);
          if (!user) {
            return {
              rank: index + 1,
              _id: contributorId,
              name: "Unknown",
              githubUsername: undefined as string | undefined,
              image: undefined as string | undefined,
              avatar_url: undefined as string | undefined,
              totalPoints: points,
              tier: "builder" as const,
            };
          }
          return {
            rank: index + 1,
            _id: contributorId,
            name: user.name ?? "Unknown",
            githubUsername: user.githubUsername,
            image: user.image,
            avatar_url: user.avatar_url,
            totalPoints: points,
            tier: user.tier ?? ("builder" as const),
          };
        })
      );

      return leaderboard;
    }
  },
});

/**
 * Get contribution stats for a user
 */
export const getUserContributionStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_contributor", (q) => q.eq("contributorId", args.userId))
      .collect();

    const verified = contributions.filter((c) => c.status === "verified");

    return {
      total: contributions.length,
      verified: verified.length,
      pending: contributions.filter((c) => c.status === "pending").length,
      rejected: contributions.filter((c) => c.status === "rejected").length,
      totalPoints: verified.reduce((sum, c) => sum + c.pointsAwarded, 0),
      byType: {
        pr_merged: verified.filter((c) => c.type === "pr_merged").length,
        feedback_accepted: verified.filter((c) => c.type === "feedback_accepted").length,
        issue_merged: verified.filter((c) => c.type === "issue_merged").length,
      },
    };
  },
});
