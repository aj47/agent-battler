"use client";

import { Zap, Star, Crown, Gem } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  tier: "builder" | "contributor" | "core" | "architect";
  showTier?: boolean;
  size?: "sm" | "md" | "lg";
}

const tierConfig = {
  builder: {
    label: "Builder",
    color: "text-gray-400",
    bgColor: "bg-gray-800",
    borderColor: "border-gray-600",
    icon: Zap,
  },
  contributor: {
    label: "Contributor",
    color: "text-blue-400",
    bgColor: "bg-blue-900/30",
    borderColor: "border-blue-600",
    icon: Star,
  },
  core: {
    label: "Core",
    color: "text-purple-400",
    bgColor: "bg-purple-900/30",
    borderColor: "border-purple-600",
    icon: Crown,
  },
  architect: {
    label: "Architect",
    color: "text-[#00FF41]",
    bgColor: "bg-[#00FF41]/10",
    borderColor: "border-[#00FF41]",
    icon: Gem,
  },
};

const sizeConfig = {
  sm: {
    container: "px-2 py-1",
    text: "text-xs",
    icon: "h-3 w-3",
  },
  md: {
    container: "px-3 py-1.5",
    text: "text-sm",
    icon: "h-4 w-4",
  },
  lg: {
    container: "px-4 py-2",
    text: "text-base",
    icon: "h-5 w-5",
  },
};

export function PointsBadge({
  points,
  tier,
  showTier = true,
  size = "md"
}: PointsBadgeProps) {
  const config = tierConfig[tier];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 ${sizes.container} ${config.bgColor} border ${config.borderColor} rounded-full`}>
      <Icon className={`${sizes.icon} ${config.color}`} />
      <span className={`${sizes.text} ${config.color} font-semibold`}>
        {points.toLocaleString()} pts
      </span>
      {showTier && (
        <span className={`${sizes.text} ${config.color} opacity-75`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function TierBadge({
  tier,
  size = "md"
}: {
  tier: "builder" | "contributor" | "core" | "architect";
  size?: "sm" | "md" | "lg";
}) {
  const config = tierConfig[tier];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizes.container} ${config.bgColor} border ${config.borderColor} rounded-full`}>
      <Icon className={`${sizes.icon} ${config.color}`} />
      <span className={`${sizes.text} ${config.color} font-medium`}>
        {config.label}
      </span>
    </span>
  );
}

export function TierProgress({
  currentPoints,
  currentTier,
  nextTier,
  pointsToNext,
}: {
  currentPoints: number;
  currentTier: string;
  nextTier: string | null;
  pointsToNext: number;
}) {
  const tierThresholds = {
    builder: 0,
    contributor: 100,
    core: 500,
    architect: 1000,
  };

  if (!nextTier || currentTier === "architect") {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#00FF41] font-medium">Max Tier Reached!</span>
          <span className="text-gray-400 text-sm">{currentPoints.toLocaleString()} pts</span>
        </div>
        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-[#00FF41] to-[#00FF41]/50" />
        </div>
      </div>
    );
  }

  const currentThreshold = tierThresholds[currentTier as keyof typeof tierThresholds] || 0;
  const nextThreshold = tierThresholds[nextTier as keyof typeof tierThresholds] || 0;
  const progressInTier = currentPoints - currentThreshold;
  const totalNeeded = nextThreshold - currentThreshold;
  const progress = Math.min(100, (progressInTier / totalNeeded) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-sm">
          <span className="font-medium">{pointsToNext}</span> pts to{" "}
          <span className="text-[#00FF41] font-medium capitalize">{nextTier}</span>
        </span>
        <span className="text-gray-400 text-sm">{currentPoints.toLocaleString()} pts</span>
      </div>
      <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00FF41] to-[#00FF41]/50 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
