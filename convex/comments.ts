import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Create a new comment on an issue (top-level comment)
 */
export const createComment = mutation({
  args: {
    issueId: v.id("issues"),
    content: v.string(),
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

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      issueId: args.issueId,
      userId,
      content: args.content.trim(),
      parentCommentId: undefined,
      isEdited: false,
      replyCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create notification for issue creator (if not commenting on own issue)
    if (issue.creatorId !== userId) {
      const user = await ctx.db.get(userId);
      await ctx.db.insert("notifications", {
        userId: issue.creatorId,
        type: "comment",
        title: "New comment on your issue",
        message: `${user?.name || "Someone"} commented on "${issue.title}"`,
        relatedIssueId: args.issueId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return commentId;
  },
});

/**
 * Create a reply to an existing comment (nested comment)
 */
export const createReply = mutation({
  args: {
    issueId: v.id("issues"),
    parentCommentId: v.id("comments"),
    content: v.string(),
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

    // Verify parent comment exists and belongs to this issue
    const parentComment = await ctx.db.get(args.parentCommentId);
    if (!parentComment) {
      throw new Error("Parent comment not found");
    }
    if (parentComment.issueId !== args.issueId) {
      throw new Error("Parent comment does not belong to this issue");
    }

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Reply content cannot be empty");
    }

    // Create the reply
    const replyId = await ctx.db.insert("comments", {
      issueId: args.issueId,
      userId,
      content: args.content.trim(),
      parentCommentId: args.parentCommentId,
      isEdited: false,
      replyCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update parent comment's reply count
    await ctx.db.patch(args.parentCommentId, {
      replyCount: parentComment.replyCount + 1,
    });

    // Create notification for parent comment author (if not replying to own comment)
    if (parentComment.userId !== userId) {
      const user = await ctx.db.get(userId);
      const parentUser = await ctx.db.get(parentComment.userId);
      await ctx.db.insert("notifications", {
        userId: parentComment.userId,
        type: "comment",
        title: "New reply to your comment",
        message: `${user?.name || "Someone"} replied to your comment on "${issue.title}"`,
        relatedIssueId: args.issueId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return replyId;
  },
});

/**
 * Get all top-level comments for an issue (with user info)
 */
export const getCommentsByIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    // Get all top-level comments (no parent)
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_issue_and_parent", (q) => 
        q.eq("issueId", args.issueId).eq("parentCommentId", undefined)
      )
      .order("desc")
      .collect();

    // Enrich with user data
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user ? {
            _id: user._id,
            name: user.name,
            githubUsername: user.githubUsername,
            image: user.image,
          } : null,
        };
      })
    );

    return enrichedComments;
  },
});

/**
 * Get all replies to a specific comment (with user info)
 */
export const getRepliesByComment = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    // Get all replies to this comment
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentCommentId", args.commentId))
      .order("asc") // Replies in chronological order
      .collect();

    // Enrich with user data
    const enrichedReplies = await Promise.all(
      replies.map(async (reply) => {
        const user = await ctx.db.get(reply.userId);
        return {
          ...reply,
          user: user ? {
            _id: user._id,
            name: user.name,
            githubUsername: user.githubUsername,
            image: user.image,
          } : null,
        };
      })
    );

    return enrichedReplies;
  },
});

/**
 * Get comment count for an issue
 */
export const getCommentCount = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();

    return comments.length;
  },
});

/**
 * Update/edit a comment
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only the comment author can edit
    if (comment.userId !== userId) {
      throw new Error("You can only edit your own comments");
    }

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment content cannot be empty");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content.trim(),
      isEdited: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a comment
 */
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only the comment author or issue creator can delete
    const issue = await ctx.db.get(comment.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    if (comment.userId !== userId && issue.creatorId !== userId) {
      throw new Error("You can only delete your own comments or comments on your issues");
    }

    // If this is a parent comment with replies, we need to handle them
    if (comment.replyCount > 0) {
      // Get all replies
      const replies = await ctx.db
        .query("comments")
        .withIndex("by_parent", (q) => q.eq("parentCommentId", args.commentId))
        .collect();

      // Delete all replies
      for (const reply of replies) {
        await ctx.db.delete(reply._id);
      }
    }

    // If this is a reply, update parent's reply count
    if (comment.parentCommentId) {
      const parentComment = await ctx.db.get(comment.parentCommentId);
      if (parentComment) {
        await ctx.db.patch(comment.parentCommentId, {
          replyCount: Math.max(0, parentComment.replyCount - 1),
        });
      }
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);

    return { success: true };
  },
});

