"use client";

import { Shield, Star, Award, Crown } from "lucide-react";

type Tier = "builder" | "contributor" | "core" | "architect";

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const tierConfig = {
  builder: {
    name: "Builder",
    color: "#6B7280",
    bgColor: "bg-gray-500/20",
    textColor: "text-gray-400",
    borderColor: "border-gray-500/30",
    icon: Shield,
  },
  contributor: {
    name: "Contributor",
    color: "#10B981",
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    icon: Star,
  },
  core: {
    name: "Core",
    color: "#8B5CF6",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    icon: Award,
  },
  architect: {
    name: "Architect",
    color: "#F59E0B",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    icon: Crown,
  },
};

const sizeConfig = {
  sm: {
    padding: "px-2 py-0.5",
    text: "text-xs",
    icon: "h-3 w-3",
    gap: "gap-1",
  },
  md: {
    padding: "px-3 py-1",
    text: "text-sm",
    icon: "h-4 w-4",
    gap: "gap-1.5",
  },
  lg: {
    padding: "px-4 py-2",
    text: "text-base",
    icon: "h-5 w-5",
    gap: "gap-2",
  },
};

export function TierBadge({ tier, size = "md", showLabel = true }: TierBadgeProps) {
  const config = tierConfig[tier];
  const sizing = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center ${sizing.gap} ${sizing.padding} ${config.bgColor} ${config.textColor} ${sizing.text} font-medium rounded-full border ${config.borderColor}`}
    >
      <Icon className={sizing.icon} />
      {showLabel && <span>{config.name}</span>}
    </span>
  );
}

export function getTierColor(tier: Tier): string {
  return tierConfig[tier].color;
}
