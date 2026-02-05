import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Repeat } from "lucide-react";
import { getPartName, getPartIcon } from "@/lib/default-parts";
import type { PartType } from "@/lib/generated/prisma";
import type { LandingStats } from "@/app/app/actions/get-landing-stats";

interface PopularPartSectionProps {
  stats: LandingStats;
}

export function PopularPartSection({ stats }: PopularPartSectionProps) {
  const { popularPartType, mostReplacedPart } = stats;

  if (!popularPartType && !mostReplacedPart) return null;

  return (
    <section className="py-12 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">
          Części w liczbach
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Statystyki z naszego serwisu
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {popularPartType && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Najczęściej monitorowana</h3>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {getPartIcon(popularPartType.type as PartType)}{" "}
                  {getPartName(popularPartType.type as PartType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {popularPartType.count.toLocaleString("pl-PL")} sztuk
                  śledzonych przez użytkowników
                </p>
              </CardContent>
            </Card>
          )}

          {mostReplacedPart && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Repeat className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-semibold">Najczęściej wymieniana</h3>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {getPartIcon(mostReplacedPart.type as PartType)}{" "}
                  {getPartName(mostReplacedPart.type as PartType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {mostReplacedPart.count.toLocaleString("pl-PL")} wymian
                  {mostReplacedPart.avgKmUsed > 0 && (
                    <span>
                      {" "}
                      · średnio co{" "}
                      {mostReplacedPart.avgKmUsed.toLocaleString("pl-PL")} km
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
