"use client";

import { Zap } from "lucide-react";
import { TierBadge } from "./TierBadge";

type Tier = "builder" | "contributor" | "core" | "architect";

interface PointsBadgeProps {
  points: number;
  tier: Tier;
  showTier?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PointsBadge({ points, tier, showTier = true, size = "md" }: PointsBadgeProps) {
  const sizeConfig = {
    sm: {
      container: "space-x-2",
      points: "text-sm",
      icon: "h-3 w-3",
    },
    md: {
      container: "space-x-3",
      points: "text-base",
      icon: "h-4 w-4",
    },
    lg: {
      container: "space-x-4",
      points: "text-lg",
      icon: "h-5 w-5",
    },
  };

  const sizing = sizeConfig[size];

  return (
    <div className={`flex items-center ${sizing.container}`}>
      <div className="flex items-center space-x-1">
        <Zap className={`${sizing.icon} text-[#00FF41]`} />
        <span className={`${sizing.points} font-bold text-[#00FF41]`}>
          {points.toLocaleString()}
        </span>
        <span className={`${sizing.points} text-gray-400`}>pts</span>
      </div>
      {showTier && <TierBadge tier={tier} size={size} />}
    </div>
  );
}
