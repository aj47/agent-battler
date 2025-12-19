"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { RewardCard } from "@/components/RewardCard";
import { TierProgress } from "@/components/PointsBadge";
import { Gift, Zap, Check, Clock, History } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function RewardsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const rewards = useQuery(api.rewards.getRewards, { onlyAvailable: true });
  const myRedemptions = useQuery(api.rewards.getMyRedemptions);
  const tierInfo = useQuery(api.users.getCurrentUserTierInfo);
  const redeemReward = useMutation(api.rewards.redeemReward);

  const [redeemingId, setRedeemingId] = useState<Id<"rewards"> | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRedeem = async (rewardId: Id<"rewards">) => {
    setError("");
    setSuccess("");
    setRedeemingId(rewardId);

    try {
      await redeemReward({ rewardId });
      setSuccess("Reward redeemed successfully! Check your redemption history below.");
    } catch (err: any) {
      setError(err.message || "Failed to redeem reward");
    } finally {
      setRedeemingId(null);
    }
  };

  const redeemedRewardIds = new Set(myRedemptions?.map((r: any) => r.rewardId) || []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Gift className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Sign in to View Rewards</h1>
          <p className="text-gray-400 mb-8">
            Earn points by contributing to projects and redeem them for exclusive rewards.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-black bg-[#00FF41] hover:bg-[#00FF41]/90 transition-colors"
          >
            Sign in with GitHub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Rewards</h1>
          <p className="text-gray-400">
            Redeem your points for exclusive rewards
          </p>
        </div>

        {/* Points & Progress */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#00FF41]/20 rounded-xl">
                <Zap className="h-8 w-8 text-[#00FF41]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Your Balance</p>
                <p className="text-3xl font-bold text-[#00FF41]">
                  {(currentUser.totalPoints ?? 0).toLocaleString()} pts
                </p>
              </div>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-4 py-2 border border-[#333333] text-sm font-medium rounded-lg text-white hover:bg-[#111111] transition-colors"
            >
              Earn More Points
            </Link>
          </div>

          {tierInfo && (
            <TierProgress
              currentPoints={tierInfo.currentPoints}
              currentTier={tierInfo.currentTier}
              nextTier={tierInfo.nextTier}
              pointsToNext={tierInfo.pointsToNextTier}
            />
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg text-green-400 flex items-center gap-2">
            <Check className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Available Rewards */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#00FF41]" />
            Available Rewards
          </h2>

          {!rewards ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
                  <div className="h-12 w-12 bg-[#222222] rounded-xl mb-4"></div>
                  <div className="h-6 bg-[#222222] rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-[#222222] rounded w-full mb-4"></div>
                  <div className="h-10 bg-[#222222] rounded"></div>
                </div>
              ))}
            </div>
          ) : rewards.length === 0 ? (
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
              <Gift className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No rewards available at the moment.</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for new rewards!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward: any) => (
                <RewardCard
                  key={reward._id}
                  reward={reward}
                  userPoints={currentUser.totalPoints ?? 0}
                  onRedeem={handleRedeem}
                  isRedeeming={redeemingId === reward._id}
                  alreadyRedeemed={redeemedRewardIds.has(reward._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Redemption History */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />
            Redemption History
          </h2>

          {!myRedemptions ? (
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
              <div className="h-16 bg-[#222222] rounded"></div>
            </div>
          ) : myRedemptions.length === 0 ? (
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
              <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No redemptions yet.</p>
              <p className="text-sm text-gray-500 mt-1">Redeem a reward above to see it here!</p>
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
              <div className="divide-y divide-[#222222]">
                {myRedemptions.map((redemption: any) => (
                  <div key={redemption._id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        redemption.status === "fulfilled"
                          ? "bg-green-900/30"
                          : "bg-yellow-900/30"
                      }`}>
                        {redemption.status === "fulfilled" ? (
                          <Check className="h-5 w-5 text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {redemption.reward?.name || "Unknown Reward"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        redemption.status === "fulfilled"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}>
                        {redemption.status === "fulfilled" ? "Delivered" : "Pending"}
                      </span>
                      {redemption.reward && (
                        <p className="text-sm text-gray-500 mt-1">
                          {redemption.reward.pointsCost} pts
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
