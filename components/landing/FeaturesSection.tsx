import { Card, CardContent } from "@/components/ui/card";
import {
  Bike,
  Wrench,
  Star,
  Bell,
  Zap,
  UserPlus,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const featureIcons = [Bike, Wrench, Star, Bell, Zap, UserPlus];

const featureKeys = [
  { title: "trackBikes", description: "trackBikesDescription" },
  { title: "monitorWear", description: "monitorWearDescription" },
  { title: "communityReviews", description: "communityReviewsDescription" },
  { title: "serviceAlerts", description: "serviceAlertsDescription" },
  { title: "eBikeSupport", description: "eBikeSupportDescription" },
  { title: "freeAccount", description: "freeAccountDescription" },
];

export async function FeaturesSection() {
  const t = await getTranslations("landing");

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          {t("whyMBike")}
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          {t("whyMBikeDescription")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t(`features.${feature.title}`)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`features.${feature.description}`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
