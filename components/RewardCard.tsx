"use client";

import { MessageCircle, Megaphone, Video, Zap, Check } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface RewardCardProps {
  reward: {
    _id: Id<"rewards">;
    name: string;
    description: string;
    pointsCost: number;
    type: "discord_role" | "shoutout" | "stream_feature";
    available: boolean;
  };
  userPoints: number;
  onRedeem?: (rewardId: Id<"rewards">) => void;
  isRedeeming?: boolean;
  alreadyRedeemed?: boolean;
}

const typeConfig = {
  discord_role: {
    icon: MessageCircle,
    gradient: "from-indigo-500 to-purple-600",
    bgGlow: "shadow-indigo-500/20",
  },
  shoutout: {
    icon: Megaphone,
    gradient: "from-pink-500 to-rose-600",
    bgGlow: "shadow-pink-500/20",
  },
  stream_feature: {
    icon: Video,
    gradient: "from-red-500 to-orange-600",
    bgGlow: "shadow-red-500/20",
  },
};

export function RewardCard({
  reward,
  userPoints,
  onRedeem,
  isRedeeming,
  alreadyRedeemed,
}: RewardCardProps) {
  const config = typeConfig[reward.type];
  const Icon = config.icon;
  const canAfford = userPoints >= reward.pointsCost;
  const canRedeem = canAfford && reward.available && !alreadyRedeemed;

  return (
    <div className={`bg-[#111111] border border-[#222222] rounded-xl overflow-hidden hover:border-[#333333] transition-all ${config.bgGlow} shadow-lg`}>
      <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[#00FF41]">
              <Zap className="h-4 w-4" />
              <span className="text-xl font-bold">{reward.pointsCost.toLocaleString()}</span>
            </div>
            <span className="text-xs text-gray-400">points</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{reward.name}</h3>
        <p className="text-gray-400 text-sm mb-6">{reward.description}</p>

        {alreadyRedeemed ? (
          <button
            disabled
            className="w-full py-3 px-4 bg-green-900/30 border border-green-600 text-green-400 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5" />
            Redeemed
          </button>
        ) : !reward.available ? (
          <button
            disabled
            className="w-full py-3 px-4 bg-gray-800 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Not Available
          </button>
        ) : canAfford ? (
          <button
            onClick={() => onRedeem?.(reward._id)}
            disabled={isRedeeming}
            className="w-full py-3 px-4 bg-[#00FF41] text-black rounded-lg font-medium hover:bg-[#00FF41]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRedeeming ? "Redeeming..." : "Redeem Reward"}
          </button>
        ) : (
          <div className="w-full py-3 px-4 bg-[#1a1a1a] border border-[#333333] text-gray-400 rounded-lg text-center">
            <span className="text-sm">
              Need <span className="text-[#00FF41] font-medium">{(reward.pointsCost - userPoints).toLocaleString()}</span> more points
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
