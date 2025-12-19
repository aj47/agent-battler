import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get all available rewards
 */
export const getRewards = query({
  args: {
    type: v.optional(
      v.union(v.literal("discord_role"), v.literal("shoutout"), v.literal("stream_feature"))
    ),
    onlyAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let rewards = await ctx.db.query("rewards").collect();

    if (args.type) {
      rewards = rewards.filter((r) => r.type === args.type);
    }

    if (args.onlyAvailable !== false) {
      rewards = rewards.filter((r) => r.available);
    }

    // Sort by points cost
    rewards.sort((a, b) => a.pointsCost - b.pointsCost);

    return rewards;
  },
});

/**
 * Get a reward by ID
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

    // Get the reward
    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }

    if (!reward.available) {
      throw new Error("Reward is not available");
    }

    // Get the user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userPoints = user.totalPoints ?? 0;

    // Check if user has enough points
    if (userPoints < reward.pointsCost) {
      throw new Error(
        `Not enough points. You have ${userPoints} points but need ${reward.pointsCost}`
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

    // Notify user
    await ctx.db.insert("notifications", {
      userId,
      type: "reward_available",
      title: "Reward Redeemed!",
      message: `You redeemed "${reward.name}" for ${reward.pointsCost} points. We'll fulfill it soon!`,
      isRead: false,
      createdAt: Date.now(),
    });

    return redemptionId;
  },
});

/**
 * Get user's redemption history
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

    // Enrich with reward info
    const enrichedRedemptions = await Promise.all(
      redemptions.map(async (redemption) => {
        const reward = await ctx.db.get(redemption.rewardId);
        return {
          ...redemption,
          reward: reward
            ? {
                _id: reward._id,
                name: reward.name,
                description: reward.description,
                pointsCost: reward.pointsCost,
                type: reward.type,
              }
            : null,
        };
      })
    );

    return enrichedRedemptions;
  },
});

/**
 * Fulfill a redemption (admin only - for now, anyone can call this)
 * In production, this should be restricted to admins
 */
export const fulfillRedemption = mutation({
  args: {
    redemptionId: v.id("redemptions"),
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
      throw new Error("Redemption already fulfilled");
    }

    await ctx.db.patch(args.redemptionId, {
      status: "fulfilled",
      fulfilledAt: Date.now(),
    });

    // Get the reward for the notification
    const reward = await ctx.db.get(redemption.rewardId);

    // Notify the user
    await ctx.db.insert("notifications", {
      userId: redemption.userId,
      type: "reward_fulfilled",
      title: "Reward Delivered!",
      message: `Your reward "${reward?.name ?? "Unknown"}" has been fulfilled!`,
      isRead: false,
      createdAt: Date.now(),
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
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // In production, add admin check here

    const rewardId = await ctx.db.insert("rewards", {
      name: args.name,
      description: args.description,
      pointsCost: args.pointsCost,
      type: args.type,
      available: true,
      createdAt: Date.now(),
    });

    return rewardId;
  },
});

/**
 * Toggle reward availability
 */
export const toggleRewardAvailability = mutation({
  args: {
    rewardId: v.id("rewards"),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // In production, add admin check here

    await ctx.db.patch(args.rewardId, {
      available: args.available,
    });

    return args.rewardId;
  },
});

/**
 * Seed initial rewards - call this once to populate rewards
 */
export const seedRewards = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if rewards already exist
    const existing = await ctx.db.query("rewards").first();
    if (existing) {
      console.log("Rewards already seeded");
      return;
    }

    const initialRewards = [
      {
        name: "Discord Builder Role",
        description: "Get the exclusive Builder role in our Discord server",
        pointsCost: 50,
        type: "discord_role" as const,
      },
      {
        name: "Discord Contributor Role",
        description: "Get the Contributor role in our Discord server",
        pointsCost: 100,
        type: "discord_role" as const,
      },
      {
        name: "Discord Core Role",
        description: "Get the Core team role in our Discord server",
        pointsCost: 500,
        type: "discord_role" as const,
      },
      {
        name: "Shoutout (130k followers)",
        description: "Get a shoutout on our social media with 130k+ followers",
        pointsCost: 200,
        type: "shoutout" as const,
      },
      {
        name: "15-min Stream Feature",
        description: "Get your project featured for 15 minutes on our stream",
        pointsCost: 500,
        type: "stream_feature" as const,
      },
      {
        name: "Full Dedicated Stream",
        description: "Get a full dedicated stream featuring your project",
        pointsCost: 1000,
        type: "stream_feature" as const,
      },
    ];

    for (const reward of initialRewards) {
      await ctx.db.insert("rewards", {
        ...reward,
        available: true,
        createdAt: Date.now(),
      });
    }

    console.log(`Seeded ${initialRewards.length} rewards`);
  },
});

/**
 * Public function to trigger seed (for development)
 */
export const triggerSeedRewards = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if rewards already exist
    const existing = await ctx.db.query("rewards").first();
    if (existing) {
      return { message: "Rewards already seeded" };
    }

    const initialRewards = [
      {
        name: "Discord Builder Role",
        description: "Get the exclusive Builder role in our Discord server",
        pointsCost: 50,
        type: "discord_role" as const,
      },
      {
        name: "Discord Contributor Role",
        description: "Get the Contributor role in our Discord server",
        pointsCost: 100,
        type: "discord_role" as const,
      },
      {
        name: "Discord Core Role",
        description: "Get the Core team role in our Discord server",
        pointsCost: 500,
        type: "discord_role" as const,
      },
      {
        name: "Shoutout (130k followers)",
        description: "Get a shoutout on our social media with 130k+ followers",
        pointsCost: 200,
        type: "shoutout" as const,
      },
      {
        name: "15-min Stream Feature",
        description: "Get your project featured for 15 minutes on our stream",
        pointsCost: 500,
        type: "stream_feature" as const,
      },
      {
        name: "Full Dedicated Stream",
        description: "Get a full dedicated stream featuring your project",
        pointsCost: 1000,
        type: "stream_feature" as const,
      },
    ];

    for (const reward of initialRewards) {
      await ctx.db.insert("rewards", {
        ...reward,
        available: true,
        createdAt: Date.now(),
      });
    }

    return { message: `Seeded ${initialRewards.length} rewards` };
  },
});
