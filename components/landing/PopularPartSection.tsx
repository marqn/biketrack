import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Repeat } from "lucide-react";
import { getPartName } from "@/lib/default-parts";
import { PartIcon } from "@/lib/part-icons";
import type { PartType } from "@/lib/generated/prisma";
import type { LandingStats } from "@/app/actions/get-landing-stats";
import { getTranslations } from "next-intl/server";

interface PopularPartSectionProps {
  stats: LandingStats;
}

export async function PopularPartSection({ stats }: PopularPartSectionProps) {
  const { popularPartType, mostReplacedPart } = stats;

  if (!popularPartType && !mostReplacedPart) return null;

  const t = await getTranslations("landing");

  return (
    <section className="py-12 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">
          {t("partsInNumbers")}
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          {t("partsStats")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {popularPartType && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{t("mostMonitored")}</h3>
                </div>
                <p className="text-3xl font-bold mb-1 flex items-center gap-2">
                  <PartIcon type={popularPartType.type as PartType} className="w-8 h-8" />
                  {getPartName(popularPartType.type as PartType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("piecesTracked", { count: popularPartType.count.toLocaleString("pl-PL") })}
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
                  <h3 className="font-semibold">{t("mostReplaced")}</h3>
                </div>
                <p className="text-3xl font-bold mb-1 flex items-center gap-2">
                  <PartIcon type={mostReplacedPart.type as PartType} className="w-8 h-8" />
                  {getPartName(mostReplacedPart.type as PartType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("replacementsCount", { count: mostReplacedPart.count.toLocaleString("pl-PL") })}
                  {mostReplacedPart.avgKmUsed > 0 && (
                    <span>
                      {" "}
                      · {t("averageEvery", { km: mostReplacedPart.avgKmUsed.toLocaleString("pl-PL") })}
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
