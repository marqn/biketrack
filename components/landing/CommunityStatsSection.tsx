import { Card, CardContent } from "@/components/ui/card";
import { Users, Bike, Route, Wrench, Star } from "lucide-react";
import type { LandingStats } from "@/app/app/actions/get-landing-stats";
import type { LucideIcon } from "lucide-react";

interface CommunityStatsSectionProps {
  stats: LandingStats;
}

interface StatItem {
  icon: LucideIcon;
  value: number;
  label: string;
}

export function CommunityStatsSection({ stats }: CommunityStatsSectionProps) {
  if (stats.totalUsers === 0) return null;

  const allItems: StatItem[] = [
    { icon: Users, value: stats.totalUsers, label: "rowerzystów" },
    { icon: Bike, value: stats.totalBikes, label: "rowerów" },
    { icon: Wrench, value: stats.totalReplacements, label: "wymian części" },
    { icon: Star, value: stats.totalReviews, label: "opinii" },
  ];

  const items = allItems.filter((item) => item.value > 0);

  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          Nasza społeczność w liczbach
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
            <Card key={item.label} className="text-center">
              <CardContent className="p-6">
                <item.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">
                  {item.value.toLocaleString("pl-PL")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
