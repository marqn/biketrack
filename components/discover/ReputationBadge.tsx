"use client";

import { Badge } from "@/components/ui/badge";

interface ReputationTier {
  minPoints: number;
  label: string;
  className: string;
  borderClass: string;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { minPoints: 0,   label: "Nowicjusz",  className: "",                                                                                   borderClass: "" },
  { minPoints: 5,   label: "Rowerzysta", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400 border-0",          borderClass: "ring-2 ring-green-500 ring-offset-1 ring-offset-background" },
  { minPoints: 25,  label: "Pasjonat",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400 border-0",             borderClass: "ring-2 ring-blue-500 ring-offset-1 ring-offset-background" },
  { minPoints: 100, label: "Ekspert",    className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400 border-0",     borderClass: "ring-2 ring-purple-500 ring-offset-1 ring-offset-background" },
  { minPoints: 500, label: "Legenda",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400 border-0",         borderClass: "ring-2 ring-amber-500 ring-offset-1 ring-offset-background" },
];

export function getReputationTier(points: number): ReputationTier {
  return [...REPUTATION_TIERS].reverse().find((t) => points >= t.minPoints) ?? REPUTATION_TIERS[0];
}

interface ReputationBadgeProps {
  points: number;
  showPoints?: boolean;
}

export function ReputationBadge({ points, showPoints = false }: ReputationBadgeProps) {
  if (points < 5) return null;
  const tier = getReputationTier(points);
  return (
    <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 font-normal ${tier.className}`}>
      {tier.label}
      {showPoints && ` · ${points} pkt`}
    </Badge>
  );
}
