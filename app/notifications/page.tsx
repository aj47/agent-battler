"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Bell,
  Check,
  X,
  Trophy,
  Zap,
  Gift,
  MessageCircle,
  GitPullRequest,
  CheckCircle,
  XCircle,
} from "lucide-react";

const notificationIcons: Record<string, typeof Bell> = {
  new_contribution: GitPullRequest,
  contribution_verified: CheckCircle,
  contribution_rejected: XCircle,
  points_awarded: Zap,
  tier_upgrade: Trophy,
  reward_fulfilled: Gift,
  comment: MessageCircle,
};

const notificationColors: Record<string, string> = {
  new_contribution: "text-blue-400 bg-blue-500/20",
  contribution_verified: "text-green-400 bg-green-500/20",
  contribution_rejected: "text-red-400 bg-red-500/20",
  points_awarded: "text-[#00FF41] bg-[#00FF41]/20",
  tier_upgrade: "text-amber-400 bg-amber-500/20",
  reward_fulfilled: "text-pink-400 bg-pink-500/20",
  comment: "text-purple-400 bg-purple-500/20",
};

export default function NotificationsPage() {
  const notifications = useQuery(api.notifications.getMyNotifications, { limit: 50 });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-medium text-[#00FF41] bg-[#00FF41]/10 rounded-lg hover:bg-[#00FF41]/20 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
          {!notifications ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF41] mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-2">
                We&apos;ll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass = notificationColors[notification.type] || "text-gray-400 bg-gray-500/20";

                return (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-[#0A0A0A] transition-colors ${
                      !notification.isRead ? "bg-[#00FF41]/5" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${colorClass.split(" ")[1]}`}>
                        <Icon className={`h-5 w-5 ${colorClass.split(" ")[0]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        {/* Link to related project if available */}
                        {notification.relatedProjectId && (
                          <Link
                            href={`/projects/${notification.relatedProjectId}`}
                            className="text-sm text-[#00FF41] hover:underline mt-2 inline-block"
                          >
                            View project
                          </Link>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2 mt-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-1 text-gray-400 hover:text-[#00FF41] transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
