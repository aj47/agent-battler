"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RewardCard } from "@/components/RewardCard";
import { PointsBadge } from "@/components/PointsBadge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Gift, Clock, Check, AlertCircle } from "lucide-react";

export default function RewardsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const rewards = useQuery(api.rewards.getRewards);
  const myRedemptions = useQuery(api.rewards.getMyRedemptions);
  const redeemReward = useMutation(api.rewards.redeemReward);

  const [redeemingId, setRedeemingId] = useState<Id<"rewards"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRedeem = async (rewardId: Id<"rewards">) => {
    setRedeemingId(rewardId);
    setError(null);
    setSuccess(null);

    try {
      await redeemReward({ rewardId });
      const reward = rewards?.find((r) => r._id === rewardId);
      setSuccess(`Successfully redeemed "${reward?.name}"! We'll process your reward soon.`);
    } catch (err: any) {
      setError(err.message || "Failed to redeem reward");
    } finally {
      setRedeemingId(null);
    }
  };

  // Check which rewards have pending redemptions
  const pendingRewardIds = new Set(
    myRedemptions
      ?.filter((r) => r.status === "pending")
      .map((r) => r.rewardId) ?? []
  );

  const userPoints = currentUser?.totalPoints ?? 0;
  const userTier = (currentUser?.tier || "builder") as "builder" | "contributor" | "core" | "architect";

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#00FF41]/10 px-4 py-2 rounded-full mb-4 border border-[#00FF41]/20">
              <Gift className="h-5 w-5 text-[#00FF41]" />
              <span className="text-[#00FF41] font-medium">Rewards Shop</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Redeem Rewards</h1>
            <p className="text-gray-400">
              Turn your contribution points into exclusive rewards
            </p>
          </div>
          {currentUser && (
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Your Balance</p>
              <PointsBadge points={userPoints} tier={userTier} size="lg" />
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Not signed in */}
        {!currentUser && (
          <div className="text-center py-12 bg-[#111111] rounded-xl border border-[#222222]">
            <Gift className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Sign in to view and redeem rewards.</p>
          </div>
        )}

        {/* Rewards Grid */}
        {currentUser && (
          <>
            {!rewards ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF41] mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading rewards...</p>
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-12 bg-[#111111] rounded-xl border border-[#222222]">
                <Gift className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No rewards available at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {rewards.map((reward) => (
                  <RewardCard
                    key={reward._id}
                    reward={reward}
                    userPoints={userPoints}
                    onRedeem={handleRedeem}
                    isRedeeming={redeemingId === reward._id}
                    alreadyRedeemed={pendingRewardIds.has(reward._id)}
                  />
                ))}
              </div>
            )}

            {/* Redemption History */}
            {myRedemptions && myRedemptions.length > 0 && (
              <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#222222]">
                  <h2 className="text-lg font-bold text-white">Your Redemptions</h2>
                </div>
                <div className="divide-y divide-[#222222]">
                  {myRedemptions.map((redemption) => (
                    <div
                      key={redemption._id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${
                            redemption.status === "fulfilled"
                              ? "bg-green-500/20"
                              : "bg-yellow-500/20"
                          }`}
                        >
                          {redemption.status === "fulfilled" ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {redemption.reward?.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Redeemed on {formatDate(redemption.redeemedAt)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          redemption.status === "fulfilled"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {redemption.status === "fulfilled" ? "Fulfilled" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
