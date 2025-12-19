"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, Reply, Edit2, Trash2, Send } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface CommentSectionProps {
  projectId: Id<"projects">;
  currentUserId?: Id<"users">;
  projectOwnerId: Id<"users">;
}

export function CommentSection({ projectId, currentUserId, projectOwnerId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = useQuery(api.comments.getCommentsByProject, { projectId });
  const commentCount = useQuery(api.comments.getCommentCount, { projectId });
  const createComment = useMutation(api.comments.createComment);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setIsSubmitting(true);
    try {
      await createComment({
        projectId,
        content: newComment,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-[#00FF41]" />
          Discussion ({commentCount ?? 0})
        </h2>
      </div>

      {/* New Comment Form */}
      {currentUserId ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, ask questions, or provide updates..."
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#00FF41] focus:border-transparent resize-none text-white placeholder:text-gray-500"
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center px-4 py-2 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00FF41]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-[#0A0A0A] border border-[#333333] rounded-lg text-center">
          <p className="text-gray-400">Please sign in to join the discussion</p>
        </div>
      )}

      {/* Comments List */}
      {!comments ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF41] mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              projectId={projectId}
              currentUserId={currentUserId}
              projectOwnerId={projectOwnerId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentProps {
  comment: any;
  projectId: Id<"projects">;
  currentUserId?: Id<"users">;
  projectOwnerId: Id<"users">;
  isReply?: boolean;
}

function Comment({ comment, projectId, currentUserId, projectOwnerId, isReply = false }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const replies = useQuery(
    api.comments.getRepliesByComment,
    showReplies ? { commentId: comment._id } : "skip"
  );
  const createReply = useMutation(api.comments.createReply);
  const updateComment = useMutation(api.comments.updateComment);
  const deleteComment = useMutation(api.comments.deleteComment);

  const isAuthor = currentUserId === comment.userId;
  const isProjectOwner = currentUserId === projectOwnerId;
  const canDelete = isAuthor || isProjectOwner;

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUserId) return;

    setIsSubmitting(true);
    try {
      await createReply({
        projectId,
        parentCommentId: comment._id,
        content: replyContent,
      });
      setReplyContent("");
      setIsReplying(false);
      setShowReplies(true);
    } catch (error) {
      console.error("Failed to create reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await updateComment({
        commentId: comment._id,
        content: editContent,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("Failed to update comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteComment({ commentId: comment._id });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <div className="border border-[#222222] rounded-lg p-4 bg-[#0A0A0A] hover:border-[#333333] transition-colors">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {comment.user?.image ? (
              <img
                src={comment.user.image}
                alt={comment.user.name || "User"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center">
                <span className="text-gray-400 font-medium">
                  {comment.user?.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">
                  {comment.user?.name || "Unknown User"}
                </span>
                {comment.userId === projectOwnerId && (
                  <span className="px-2 py-0.5 bg-[#00FF41]/20 text-[#00FF41] text-xs rounded-full">
                    Owner
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDate(comment.createdAt)}</span>
                {comment.isEdited && <span>• edited</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {currentUserId && (
            <div className="flex items-center space-x-2">
              {isAuthor && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-gray-500 hover:text-[#00FF41] p-1 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}
              {canDelete && (
                <button
                  onClick={handleDeleteComment}
                  className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#00FF41] focus:border-transparent resize-none text-white placeholder:text-gray-500"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComment}
                disabled={!editContent.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00FF41]/90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-300 mb-3">
            <MarkdownRenderer content={comment.content} />
          </div>
        )}

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-sm">
          {currentUserId && !isReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center text-gray-500 hover:text-[#00FF41] transition-colors"
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </button>
          )}
          {!isReply && comment.replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center text-gray-500 hover:text-[#00FF41] transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              {showReplies ? "Hide" : "Show"} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <form onSubmit={handleSubmitReply} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-3 py-2 bg-[#111111] border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#00FF41] focus:border-transparent resize-none text-white placeholder:text-gray-500"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00FF41]/90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && replies && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              projectId={projectId}
              currentUserId={currentUserId}
              projectOwnerId={projectOwnerId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
