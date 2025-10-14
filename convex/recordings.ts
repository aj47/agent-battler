import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Generate an upload URL for a recording file
 * Used by the client to upload .cast files directly to Convex storage
 */
export const generateRecordingUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Attach a recording to a pull request
 * Called after the recording file has been uploaded to storage
 */
export const attachRecordingToPR = mutation({
  args: {
    prId: v.id("pullRequests"),
    storageId: v.string(), // Convex storage ID from upload
    recordingUrl: v.optional(v.string()), // Optional external URL (e.g., asciinema.org)
    metadata: v.object({
      duration: v.number(), // Duration in seconds
      fileSize: v.number(), // File size in bytes
    }),
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

    // Verify user is the PR submitter
    if (pr.submitterId !== userId) {
      throw new Error("Only the PR submitter can attach recordings");
    }

    // Update PR with recording info
    await ctx.db.patch(args.prId, {
      recordingStorageId: args.storageId,
      recordingUrl: args.recordingUrl,
      recordingMetadata: {
        duration: args.metadata.duration,
        fileSize: args.metadata.fileSize,
        uploadedAt: Date.now(),
        format: "asciicast_v3",
      },
      updatedAt: Date.now(),
    });

    return args.prId;
  },
});

/**
 * Get recording download URL for a PR
 * Returns a URL that can be used to download the .cast file
 */
export const getRecordingDownloadUrl = query({
  args: { prId: v.id("pullRequests") },
  handler: async (ctx, args) => {
    const pr = await ctx.db.get(args.prId);
    if (!pr) {
      throw new Error("Pull request not found");
    }

    if (!pr.recordingStorageId) {
      return null;
    }

    // Generate a download URL for the stored file
    const downloadUrl = await ctx.storage.getUrl(pr.recordingStorageId);
    return downloadUrl;
  },
});

/**
 * Get recording metadata for a PR
 */
export const getRecordingMetadata = query({
  args: { prId: v.id("pullRequests") },
  handler: async (ctx, args) => {
    const pr = await ctx.db.get(args.prId);
    if (!pr) {
      throw new Error("Pull request not found");
    }

    return {
      hasRecording: !!pr.recordingStorageId,
      recordingUrl: pr.recordingUrl,
      metadata: pr.recordingMetadata,
    };
  },
});

/**
 * Remove recording from a PR
 * Only the PR submitter can do this
 */
export const removeRecording = mutation({
  args: { prId: v.id("pullRequests") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const pr = await ctx.db.get(args.prId);
    if (!pr) {
      throw new Error("Pull request not found");
    }

    // Verify user is the PR submitter
    if (pr.submitterId !== userId) {
      throw new Error("Only the PR submitter can remove recordings");
    }

    if (pr.recordingStorageId) {
      // Delete the file from storage
      await ctx.storage.delete(pr.recordingStorageId);
    }

    // Clear recording fields from PR
    await ctx.db.patch(args.prId, {
      recordingStorageId: undefined,
      recordingUrl: undefined,
      recordingMetadata: undefined,
      updatedAt: Date.now(),
    });

    return args.prId;
  },
});

