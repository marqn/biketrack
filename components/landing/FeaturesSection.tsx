import { Card, CardContent } from "@/components/ui/card";
import {
  Bike,
  Wrench,
  Star,
  Bell,
  Zap,
  UserPlus,
} from "lucide-react";

const features = [
  {
    icon: Bike,
    title: "Śledź swoje rowery",
    description:
      "Dodaj rowery i monitoruj przebieg każdego z nich. Szosa, gravel, MTB a może trenażer — wszystko w jednym miejscu.",
  },
  {
    icon: Wrench,
    title: "Monitoruj zużycie części",
    description:
      "Wiele typów części z automatycznym śledzeniem zużycia. Wiedz, kiedy wymienić łańcuch, klocki czy opony.",
  },
  {
    icon: Star,
    title: "Opinie społeczności",
    description:
      "Sprawdź oceny produktów od prawdziwych użytkowników z zweryfikowanymi przebiegami.",
  },
  {
    icon: Bell,
    title: "Powiadomienia o serwisie",
    description:
      "Nigdy nie przegap wymiany łańcucha, klocków czy uzupełnienia mleka tubeless.",
  },
  {
    icon: Zap,
    title: "Wsparcie e-bike",
    description:
      "Pełne wsparcie dla rowerów elektrycznych: silnik, akumulator, sterownik.",
  },
  {
    icon: UserPlus,
    title: "Darmowe konto na start",
    description:
      "Zacznij za darmo z jednym rowerem. Rozszerz do Premium, aby dodać więcej.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          Dlaczego MBike?
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Wszystko, czego potrzebujesz do zarządzania serwisem swojego roweru
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
