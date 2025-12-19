import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Define the schema for the Builder Community Platform
const schema = defineSchema({
  // Include auth tables from Convex Auth
  ...authTables,

  // Users table - extends auth with additional profile info
  users: defineTable({
    // Fields from authTables (required by Convex Auth)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // GitHub OAuth fields
    githubId: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    login: v.optional(v.string()), // GitHub login (same as githubUsername)
    avatar_url: v.optional(v.string()), // GitHub avatar URL (same as image)
    githubAccessToken: v.optional(v.string()), // Store encrypted token for API calls
    // Builder Community fields
    totalPoints: v.optional(v.number()), // Total contribution points earned
    discordId: v.optional(v.string()), // Discord ID for rewards
    tier: v.optional(
      v.union(
        v.literal("builder"),
        v.literal("contributor"),
        v.literal("core"),
        v.literal("architect")
      )
    ),
    // Legacy fields (deprecated, keep for migration)
    totalEarnings: v.optional(v.number()),
    totalBountiesPosted: v.optional(v.number()),
    totalPRsSubmitted: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_github_id", ["githubId"])
    .index("by_github_username", ["githubUsername"])
    .index("by_total_points", ["totalPoints"])
    .index("email", ["email"]) // Must be named "email" for Convex Auth compatibility
    .index("phone", ["phone"]), // Must be named "phone" for Convex Auth compatibility

  // Projects table - GitHub repos submitted to the platform
  projects: defineTable({
    ownerId: v.id("users"), // User who submitted this project
    githubRepoUrl: v.string(), // Full GitHub repo URL
    githubRepoOwner: v.string(), // e.g., "aj47"
    githubRepoName: v.string(), // e.g., "agent-battler"
    title: v.string(), // Display title
    description: v.string(), // Project description
    helpWanted: v.string(), // What kind of help they need
    tags: v.array(v.string()), // e.g., ["nextjs", "typescript", "ai"]
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
    contributionCount: v.optional(v.number()), // Number of contributions
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_repo", ["githubRepoOwner", "githubRepoName"])
    .index("by_created_at", ["createdAt"]),

  // Contributions table - tracks contributions to projects
  contributions: defineTable({
    contributorId: v.id("users"), // User who made the contribution
    projectId: v.id("projects"), // Project being contributed to
    type: v.union(
      v.literal("pr_merged"),
      v.literal("feedback_accepted"),
      v.literal("issue_merged")
    ),
    githubUrl: v.string(), // Link to the PR or issue
    title: v.optional(v.string()), // Title of the PR/issue
    description: v.optional(v.string()), // Description/summary
    pointsAwarded: v.number(), // Points earned for this contribution
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    verificationNote: v.optional(v.string()), // Note from project owner
    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_contributor", ["contributorId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_project_status", ["projectId", "status"]),

  // Rewards table - available rewards for point redemption
  rewards: defineTable({
    name: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    type: v.union(
      v.literal("discord_role"),
      v.literal("shoutout"),
      v.literal("stream_feature")
    ),
    available: v.boolean(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_points_cost", ["pointsCost"])
    .index("by_available", ["available"]),

  // Redemptions table - tracks reward redemptions
  redemptions: defineTable({
    userId: v.id("users"),
    rewardId: v.id("rewards"),
    status: v.union(v.literal("pending"), v.literal("fulfilled")),
    redeemedAt: v.number(),
    fulfilledAt: v.optional(v.number()),
    notes: v.optional(v.string()), // Admin notes
  })
    .index("by_user", ["userId"])
    .index("by_reward", ["rewardId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // Comments table - for discussions on projects
  comments: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    content: v.string(),
    // For threaded/nested comments - if null, it's a top-level comment
    parentCommentId: v.optional(v.id("comments")),
    // Track if comment has been edited
    isEdited: v.boolean(),
    // Track number of replies for efficient display
    replyCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"])
    .index("by_project_and_parent", ["projectId", "parentCommentId"]),

  // Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_contribution"), // New contribution on your project
      v.literal("contribution_verified"), // Your contribution was verified
      v.literal("contribution_rejected"), // Your contribution was rejected
      v.literal("points_awarded"), // You earned points
      v.literal("tier_upgrade"), // You reached a new tier
      v.literal("reward_fulfilled"), // Your reward was fulfilled
      v.literal("comment") // New comment
    ),
    title: v.string(),
    message: v.string(),
    relatedProjectId: v.optional(v.id("projects")),
    relatedContributionId: v.optional(v.id("contributions")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});

export default schema;
