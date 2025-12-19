import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";

// Point values for different contribution types
export const POINT_VALUES = {
  pr_merged: 50,
  feedback_accepted: 20,
  issue_merged: 30,
};

// Tier thresholds
export const TIER_THRESHOLDS = {
  builder: 0,
  contributor: 100,
  core: 500,
  architect: 1000,
};

/**
 * Get point values for contribution types
 */
export const getPointValues = query({
  args: {},
  handler: async () => {
    return POINT_VALUES;
  },
});

/**
 * Get tier thresholds
 */
export const getTierThresholds = query({
  args: {},
  handler: async () => {
    return TIER_THRESHOLDS;
  },
});

/**
 * Calculate tier based on points
 */
export function calculateUserTier(
  points: number
): "builder" | "contributor" | "core" | "architect" {
  if (points >= TIER_THRESHOLDS.architect) return "architect";
  if (points >= TIER_THRESHOLDS.core) return "core";
  if (points >= TIER_THRESHOLDS.contributor) return "contributor";
  return "builder";
}

/**
 * Get current user's point info
 */
export const getMyPointInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const points = user.totalPoints || 0;
    const tier = calculateUserTier(points);

    // Calculate progress to next tier
    let nextTier: string | null = null;
    let pointsToNextTier = 0;
    let progress = 100;

    if (tier === "builder") {
      nextTier = "contributor";
      pointsToNextTier = TIER_THRESHOLDS.contributor - points;
      progress = (points / TIER_THRESHOLDS.contributor) * 100;
    } else if (tier === "contributor") {
      nextTier = "core";
      pointsToNextTier = TIER_THRESHOLDS.core - points;
      progress =
        ((points - TIER_THRESHOLDS.contributor) /
          (TIER_THRESHOLDS.core - TIER_THRESHOLDS.contributor)) *
        100;
    } else if (tier === "core") {
      nextTier = "architect";
      pointsToNextTier = TIER_THRESHOLDS.architect - points;
      progress =
        ((points - TIER_THRESHOLDS.core) /
          (TIER_THRESHOLDS.architect - TIER_THRESHOLDS.core)) *
        100;
    }

    return {
      points,
      tier,
      nextTier,
      pointsToNextTier,
      progress: Math.min(progress, 100),
    };
  },
});

/**
 * Get tier badge styling info
 */
export const getTierInfo = query({
  args: {
    tier: v.union(
      v.literal("builder"),
      v.literal("contributor"),
      v.literal("core"),
      v.literal("architect")
    ),
  },
  handler: async (_, args) => {
    const tierInfo = {
      builder: {
        name: "Builder",
        color: "#6B7280", // gray
        description: "Just getting started",
        minPoints: 0,
      },
      contributor: {
        name: "Contributor",
        color: "#10B981", // green
        description: "Active community member",
        minPoints: 100,
      },
      core: {
        name: "Core",
        color: "#8B5CF6", // purple
        description: "Dedicated contributor",
        minPoints: 500,
      },
      architect: {
        name: "Architect",
        color: "#F59E0B", // gold
        description: "Community leader",
        minPoints: 1000,
      },
    };

    return tierInfo[args.tier];
  },
});

/**
 * Get all tiers info
 */
export const getAllTiersInfo = query({
  args: {},
  handler: async () => {
    return {
      builder: {
        name: "Builder",
        color: "#6B7280",
        description: "Just getting started",
        minPoints: 0,
      },
      contributor: {
        name: "Contributor",
        color: "#10B981",
        description: "Active community member",
        minPoints: 100,
      },
      core: {
        name: "Core",
        color: "#8B5CF6",
        description: "Dedicated contributor",
        minPoints: 500,
      },
      architect: {
        name: "Architect",
        color: "#F59E0B",
        description: "Community leader",
        minPoints: 1000,
      },
    };
  },
});
