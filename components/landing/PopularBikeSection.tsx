import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { bikeTypeLabels } from "@/lib/types";
import type { BikeType } from "@/lib/generated/prisma";
import type { LandingStats } from "@/app/app/actions/get-landing-stats";

interface PopularBikeSectionProps {
  stats: LandingStats;
}

export function PopularBikeSection({ stats }: PopularBikeSectionProps) {
  const { popularBikeBrand, bikeTypeDistribution } = stats;

  if (!popularBikeBrand && bikeTypeDistribution.length === 0) return null;

  const totalBikesInDist = bikeTypeDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">
          Najpopularniejsze rowery
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Na czym jeżdżą nasi użytkownicy
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {popularBikeBrand && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <Badge variant="secondary">Najpopularniejsza marka</Badge>
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {popularBikeBrand.brand}
                </p>
                <p className="text-sm text-muted-foreground">
                  {popularBikeBrand.count}{" "}
                  {popularBikeBrand.count === 1
                    ? "rower"
                    : popularBikeBrand.count < 5
                      ? "rowery"
                      : "rowerów"}{" "}
                  w serwisie
                </p>
              </CardContent>
            </Card>
          )}

          {bikeTypeDistribution.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Typy rowerów</h3>
                <div className="space-y-3">
                  {bikeTypeDistribution.map((item) => {
                    const percentage = Math.round(
                      (item.count / totalBikesInDist) * 100
                    );
                    const label =
                      bikeTypeLabels[item.type as BikeType] || item.type;

                    return (
                      <div key={item.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span className="text-muted-foreground">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
