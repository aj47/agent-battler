"use client";

import { Gift, MessageCircle, Video, Check, Clock } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type RewardType = "discord_role" | "shoutout" | "stream_feature";

interface Reward {
  _id: Id<"rewards">;
  name: string;
  description: string;
  pointsCost: number;
  type: RewardType;
  available: boolean;
  imageUrl?: string;
}

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (rewardId: Id<"rewards">) => void;
  isRedeeming?: boolean;
  alreadyRedeemed?: boolean;
}

const typeConfig = {
  discord_role: {
    icon: MessageCircle,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
  },
  shoutout: {
    icon: Gift,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
  },
  stream_feature: {
    icon: Video,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
};

export function RewardCard({
  reward,
  userPoints,
  onRedeem,
  isRedeeming = false,
  alreadyRedeemed = false,
}: RewardCardProps) {
  const config = typeConfig[reward.type];
  const Icon = config.icon;
  const canAfford = userPoints >= reward.pointsCost;
  const isDisabled = !canAfford || !reward.available || isRedeeming || alreadyRedeemed;

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col">
      {/* Icon and Type */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${config.bgColor}`}>
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase">
          {reward.type.replace("_", " ")}
        </span>
      </div>

      {/* Name and Description */}
      <h3 className="text-lg font-semibold text-white mb-2">{reward.name}</h3>
      <p className="text-sm text-gray-400 flex-1 mb-4">{reward.description}</p>

      {/* Cost */}
      <div className="flex items-center justify-between mb-4 p-3 bg-[#0A0A0A] rounded-lg">
        <span className="text-sm text-gray-400">Cost</span>
        <span className={`text-lg font-bold ${canAfford ? "text-[#00FF41]" : "text-red-400"}`}>
          {reward.pointsCost.toLocaleString()} pts
        </span>
      </div>

      {/* Redeem Button */}
      {alreadyRedeemed ? (
        <button
          disabled
          className="w-full py-3 px-4 bg-gray-700 text-gray-400 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-not-allowed"
        >
          <Clock className="h-4 w-4" />
          <span>Pending Fulfillment</span>
        </button>
      ) : (
        <button
          onClick={() => onRedeem(reward._id)}
          disabled={isDisabled}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isDisabled
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#00FF41] text-black hover:bg-[#00CC33]"
          }`}
        >
          {isRedeeming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              <span>Redeeming...</span>
            </>
          ) : canAfford ? (
            <>
              <Check className="h-4 w-4" />
              <span>Redeem</span>
            </>
          ) : (
            <span>Need {(reward.pointsCost - userPoints).toLocaleString()} more pts</span>
          )}
        </button>
      )}
    </div>
  );
}
