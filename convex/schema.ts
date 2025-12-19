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
    // GitHub auth fields
    githubId: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    login: v.optional(v.string()), // GitHub login (same as githubUsername)
    avatar_url: v.optional(v.string()), // GitHub avatar URL (same as image)
    githubAccessToken: v.optional(v.string()), // Store encrypted token for API calls
    // Builder Community fields
    totalPoints: v.optional(v.number()), // Total points earned from contributions
    discordId: v.optional(v.string()), // Discord user ID for rewards
    tier: v.optional(
      v.union(
        v.literal("builder"),      // 0+ points (default)
        v.literal("contributor"),  // 100+ points
        v.literal("core"),         // 500+ points
        v.literal("architect")     // 1000+ points
      )
    ),
    createdAt: v.optional(v.number()),
  })
    .index("by_github_id", ["githubId"])
    .index("by_github_username", ["githubUsername"])
    .index("by_total_points", ["totalPoints"])
    .index("email", ["email"]) // Must be named "email" for Convex Auth compatibility
    .index("phone", ["phone"]), // Must be named "phone" for Convex Auth compatibility

  // Projects table - GitHub projects submitted to the platform
  projects: defineTable({
    ownerId: v.id("users"), // User who submitted this project
    githubRepoUrl: v.string(), // Full GitHub repo URL
    githubRepoOwner: v.string(), // e.g., "facebook"
    githubRepoName: v.string(), // e.g., "react"
    title: v.string(), // Project title
    description: v.string(), // What the project does
    helpWanted: v.string(), // What kind of help they need
    tags: v.array(v.string()), // e.g., ["react", "typescript", "frontend"]
    status: v.union(
      v.literal("active"),    // Actively seeking contributions
      v.literal("paused"),    // Temporarily not accepting contributions
      v.literal("completed")  // Project is complete/archived
    ),
    contributionCount: v.optional(v.number()), // Number of verified contributions
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_repo", ["githubRepoOwner", "githubRepoName"]),

  // Contributions table - tracks contributions to projects
  contributions: defineTable({
    contributorId: v.id("users"), // User who made the contribution
    projectId: v.id("projects"), // Project contributed to
    type: v.union(
      v.literal("pr_merged"),        // 50 points
      v.literal("feedback_accepted"), // 20 points
      v.literal("issue_merged")      // 30 points (actually issue_resolved - keeping name for clarity)
    ),
    githubUrl: v.string(), // Link to the PR or issue
    pointsAwarded: v.number(), // Points given for this contribution
    status: v.union(
      v.literal("pending"),   // Awaiting verification
      v.literal("verified"),  // Verified by project owner
      v.literal("rejected")   // Rejected by project owner
    ),
    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_contributor", ["contributorId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Rewards table - available rewards users can redeem
  rewards: defineTable({
    name: v.string(), // e.g., "Discord Builder Role"
    description: v.string(),
    pointsCost: v.number(), // Points required to redeem
    type: v.union(
      v.literal("discord_role"),   // Discord role assignment
      v.literal("shoutout"),       // Social media shoutout
      v.literal("stream_feature")  // Featured on stream
    ),
    available: v.boolean(), // Whether reward is currently available
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_available", ["available"])
    .index("by_points_cost", ["pointsCost"]),

  // Redemptions table - tracks reward redemptions
  redemptions: defineTable({
    userId: v.id("users"),
    rewardId: v.id("rewards"),
    status: v.union(
      v.literal("pending"),   // Redemption requested
      v.literal("fulfilled")  // Reward delivered
    ),
    redeemedAt: v.number(),
    fulfilledAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_reward", ["rewardId"])
    .index("by_status", ["status"]),

  // Comments table - for discussions on projects
  comments: defineTable({
    projectId: v.id("projects"), // Changed from issueId
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
      v.literal("new_contribution"),       // New contribution to your project
      v.literal("contribution_verified"),  // Your contribution was verified
      v.literal("contribution_rejected"),  // Your contribution was rejected
      v.literal("reward_available"),       // New reward available
      v.literal("reward_fulfilled"),       // Your reward was fulfilled
      v.literal("comment")                 // New comment on your project
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

  // User favorites/bookmarks for projects
  favorites: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"), // Changed from issueId
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_project", ["userId", "projectId"]),
});

export default schema;
