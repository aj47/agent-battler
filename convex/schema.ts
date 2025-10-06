import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Define the schema for the Agent Battler platform
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
    // Custom fields for Agent Battler
    githubId: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    login: v.optional(v.string()), // GitHub login (same as githubUsername)
    avatar_url: v.optional(v.string()), // GitHub avatar URL (same as image)
    githubAccessToken: v.optional(v.string()), // Store encrypted token for API calls
    totalEarnings: v.optional(v.number()), // Total bounty points earned
    totalBountiesPosted: v.optional(v.number()), // Total bounties posted
    totalPRsSubmitted: v.optional(v.number()), // Total PRs submitted
    createdAt: v.optional(v.number()),
  })
    .index("by_github_id", ["githubId"])
    .index("by_github_username", ["githubUsername"])
    .index("email", ["email"]) // Must be named "email" for Convex Auth compatibility
    .index("phone", ["phone"]), // Must be named "phone" for Convex Auth compatibility

  // Coding Agents/Tools table
  codingAgents: defineTable({
    name: v.string(), // e.g., "Augment", "Cursor", "GitHub Copilot"
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Issues table - stores GitHub issues posted to the platform
  issues: defineTable({
    // GitHub issue details
    githubIssueId: v.number(), // GitHub's issue ID
    githubIssueNumber: v.number(), // Issue number in the repo
    repoOwner: v.string(),
    repoName: v.string(),
    title: v.string(),
    description: v.string(),
    githubUrl: v.string(),
    labels: v.array(v.string()),
    
    // Platform-specific fields
    creatorId: v.id("users"), // User who posted this issue
    bountyAmount: v.number(), // Bounty points offered
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      )
    ),
    
    // Tracking
    viewCount: v.number(),
    prCount: v.number(), // Number of PRs submitted
    winnerId: v.optional(v.id("users")), // User who won the bounty
    winningPrId: v.optional(v.id("pullRequests")),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"])
    .index("by_repo", ["repoOwner", "repoName"])
    .index("by_bounty", ["bountyAmount"])
    .index("by_github_issue", ["githubIssueId"])
    .index("by_created_at", ["createdAt"]),

  // Pull Requests table - tracks PR submissions
  pullRequests: defineTable({
    // GitHub PR details
    githubPrId: v.number(), // GitHub's PR ID
    githubPrNumber: v.number(), // PR number in the repo
    repoOwner: v.string(),
    repoName: v.string(),
    title: v.string(),
    description: v.string(),
    githubUrl: v.string(),
    
    // Platform-specific fields
    issueId: v.id("issues"), // Linked issue
    submitterId: v.id("users"), // User who submitted the PR
    codingAgentId: v.optional(v.id("codingAgents")), // Tool used
    
    // PR status
    status: v.union(
      v.literal("pending"), // Submitted but not reviewed
      v.literal("approved"), // Approved by issue creator
      v.literal("rejected"), // Rejected
      v.literal("merged"), // Merged on GitHub
      v.literal("closed") // Closed without merge
    ),
    
    // Feedback
    feedback: v.optional(v.string()), // Feedback from issue creator
    rating: v.optional(v.number()), // Rating 1-5
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_issue", ["issueId"])
    .index("by_submitter", ["submitterId"])
    .index("by_status", ["status"])
    .index("by_coding_agent", ["codingAgentId"])
    .index("by_github_pr", ["githubPrId"])
    .index("by_created_at", ["createdAt"]),

  // Bounty Transactions table - tracks bounty awards
  bountyTransactions: defineTable({
    issueId: v.id("issues"),
    pullRequestId: v.id("pullRequests"),
    fromUserId: v.id("users"), // Issue creator
    toUserId: v.id("users"), // PR submitter
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_issue", ["issueId"])
    .index("by_from_user", ["fromUserId"])
    .index("by_to_user", ["toUserId"])
    .index("by_status", ["status"]),

  // Comments table - for forum-style discussions on issues with nested replies
  comments: defineTable({
    issueId: v.id("issues"),
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
    .index("by_issue", ["issueId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"])
    .index("by_issue_and_parent", ["issueId", "parentCommentId"]),

  // Notifications table
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_pr"), // New PR on your issue
      v.literal("pr_approved"), // Your PR was approved
      v.literal("pr_rejected"), // Your PR was rejected
      v.literal("bounty_awarded"), // You won a bounty
      v.literal("issue_resolved"), // Issue you're watching was resolved
      v.literal("comment") // New comment
    ),
    title: v.string(),
    message: v.string(),
    relatedIssueId: v.optional(v.id("issues")),
    relatedPrId: v.optional(v.id("pullRequests")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),

  // User favorites/bookmarks
  favorites: defineTable({
    userId: v.id("users"),
    issueId: v.id("issues"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_issue", ["issueId"])
    .index("by_user_issue", ["userId", "issueId"]),
});

export default schema;

