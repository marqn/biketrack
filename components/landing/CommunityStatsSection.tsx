import { Card, CardContent } from "@/components/ui/card";
import { Users, Bike, Route, Wrench, Star } from "lucide-react";
import type { LandingStats } from "@/app/actions/get-landing-stats";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface CommunityStatsSectionProps {
  stats: LandingStats;
}

interface StatItem {
  icon: LucideIcon;
  value: number;
  labelKey: string;
}

export async function CommunityStatsSection({ stats }: CommunityStatsSectionProps) {
  if (stats.totalUsers === 0) return null;

  const t = await getTranslations("landing");

  const allItems: StatItem[] = [
    { icon: Users, value: stats.totalUsers, labelKey: "statsCyclists" },
    { icon: Bike, value: stats.totalBikes, labelKey: "statsBikes" },
    { icon: Wrench, value: stats.totalReplacements, labelKey: "statsReplacements" },
    { icon: Star, value: stats.totalReviews, labelKey: "statsReviews" },
  ];

  const items = allItems.filter((item) => item.value > 0);

  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("communityStats")}
        </h2>
        <div
          className={`grid grid-cols-2 gap-4 ${
            items.length >= 4
              ? "md:grid-cols-3 lg:grid-cols-4"
              : items.length >= 3
                ? "md:grid-cols-3"
                : "md:grid-cols-2"
          }`}
        >
          {items.map((item) => (
            <Card key={item.labelKey} className="text-center">
              <CardContent className="p-6">
                <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">
                  {item.value.toLocaleString("pl-PL")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(item.labelKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
