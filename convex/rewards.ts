import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get all available rewards
 */
export const getRewards = query({
  args: {},
  handler: async (ctx) => {
    const rewards = await ctx.db
      .query("rewards")
      .withIndex("by_available", (q) => q.eq("available", true))
      .collect();

    // Sort by points cost
    return rewards.sort((a, b) => a.pointsCost - b.pointsCost);
  },
});

/**
 * Get all rewards (including unavailable) for admin
 */
export const getAllRewards = query({
  args: {},
  handler: async (ctx) => {
    const rewards = await ctx.db
      .query("rewards")
      .order("asc")
      .collect();

    return rewards.sort((a, b) => a.pointsCost - b.pointsCost);
  },
});

/**
 * Get reward by ID
 */
export const getRewardById = query({
  args: { rewardId: v.id("rewards") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.rewardId);
  },
});

/**
 * Redeem a reward
 */
export const redeemReward = mutation({
  args: {
    rewardId: v.id("rewards"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }

    if (!reward.available) {
      throw new Error("This reward is not currently available");
    }

    const userPoints = user.totalPoints || 0;
    if (userPoints < reward.pointsCost) {
      throw new Error(
        `Not enough points. You need ${reward.pointsCost} points but only have ${userPoints}`
      );
    }

    // Deduct points
    await ctx.db.patch(userId, {
      totalPoints: userPoints - reward.pointsCost,
    });

    // Create redemption record
    const redemptionId = await ctx.db.insert("redemptions", {
      userId,
      rewardId: args.rewardId,
      status: "pending",
      redeemedAt: Date.now(),
    });

    return redemptionId;
  },
});

/**
 * Get redemptions by current user
 */
export const getMyRedemptions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const redemptions = await ctx.db
      .query("redemptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Get reward info for each redemption
    const redemptionsWithRewards = await Promise.all(
      redemptions.map(async (redemption) => {
        const reward = await ctx.db.get(redemption.rewardId);
        return {
          ...redemption,
          reward: reward
            ? {
                _id: reward._id,
                name: reward.name,
                description: reward.description,
                type: reward.type,
                pointsCost: reward.pointsCost,
              }
            : null,
        };
      })
    );

    return redemptionsWithRewards;
  },
});

/**
 * Fulfill a redemption (admin only - for now just owner check not implemented)
 */
export const fulfillRedemption = mutation({
  args: {
    redemptionId: v.id("redemptions"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption) {
      throw new Error("Redemption not found");
    }

    if (redemption.status === "fulfilled") {
      throw new Error("Redemption has already been fulfilled");
    }

    const now = Date.now();

    await ctx.db.patch(args.redemptionId, {
      status: "fulfilled",
      fulfilledAt: now,
      notes: args.notes,
    });

    // Notify user
    const reward = await ctx.db.get(redemption.rewardId);
    await ctx.db.insert("notifications", {
      userId: redemption.userId,
      type: "reward_fulfilled",
      title: "Reward Fulfilled!",
      message: `Your reward "${reward?.name || "Unknown"}" has been fulfilled!`,
      isRead: false,
      createdAt: now,
    });

    return args.redemptionId;
  },
});

/**
 * Create a new reward (admin function)
 */
export const createReward = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    type: v.union(
      v.literal("discord_role"),
      v.literal("shoutout"),
      v.literal("stream_feature")
    ),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const rewardId = await ctx.db.insert("rewards", {
      name: args.name,
      description: args.description,
      pointsCost: args.pointsCost,
      type: args.type,
      available: true,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });

    return rewardId;
  },
});

/**
 * Update reward availability
 */
export const updateRewardAvailability = mutation({
  args: {
    rewardId: v.id("rewards"),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.rewardId, {
      available: args.available,
    });

    return args.rewardId;
  },
});

/**
 * Seed initial rewards
 */
export const seedRewards = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if rewards already exist
    const existingRewards = await ctx.db.query("rewards").first();
    if (existingRewards) {
      throw new Error("Rewards have already been seeded");
    }

    const now = Date.now();

    const rewards = [
      {
        name: "Discord Builder Role",
        description: "Get the exclusive Builder role in our Discord server",
        pointsCost: 50,
        type: "discord_role" as const,
        available: true,
        createdAt: now,
      },
      {
        name: "Discord Contributor Role",
        description: "Get the Contributor role showing your dedication to the community",
        pointsCost: 100,
        type: "discord_role" as const,
        available: true,
        createdAt: now,
      },
      {
        name: "Discord Core Role",
        description: "Get the prestigious Core role for top contributors",
        pointsCost: 500,
        type: "discord_role" as const,
        available: true,
        createdAt: now,
      },
      {
        name: "Shoutout (130k followers)",
        description: "Get a shoutout to our 130k+ followers on social media",
        pointsCost: 200,
        type: "shoutout" as const,
        available: true,
        createdAt: now,
      },
      {
        name: "15-min Stream Feature",
        description: "Get your project featured for 15 minutes during a live stream",
        pointsCost: 500,
        type: "stream_feature" as const,
        available: true,
        createdAt: now,
      },
      {
        name: "Full Dedicated Stream",
        description: "Get a full dedicated stream focused on your project",
        pointsCost: 1000,
        type: "stream_feature" as const,
        available: true,
        createdAt: now,
      },
    ];

    for (const reward of rewards) {
      await ctx.db.insert("rewards", reward);
    }

    return { seeded: rewards.length };
  },
});

/**
 * Get pending redemptions (for admin)
 */
export const getPendingRedemptions = query({
  args: {},
  handler: async (ctx) => {
    const redemptions = await ctx.db
      .query("redemptions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // Get user and reward info
    const redemptionsWithDetails = await Promise.all(
      redemptions.map(async (redemption) => {
        const [user, reward] = await Promise.all([
          ctx.db.get(redemption.userId),
          ctx.db.get(redemption.rewardId),
        ]);
        return {
          ...redemption,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                githubUsername: user.githubUsername,
                image: user.image,
                discordId: user.discordId,
              }
            : null,
          reward: reward
            ? {
                _id: reward._id,
                name: reward.name,
                type: reward.type,
                pointsCost: reward.pointsCost,
              }
            : null,
        };
      })
    );

    return redemptionsWithDetails;
  },
});
