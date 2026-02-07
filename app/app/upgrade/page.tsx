"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Crown,
  Bike,
  BarChart3,
  FileDown,
  Bell,
  GitCompareArrows,
  Check,
  Loader2,
} from "lucide-react";

const plans = [
  {
    id: "1month",
    name: "Miesięczny",
    price: "3",
    period: "/ miesiąc",
    duration: "1 miesiąc",
    description: "Idealne na próbę",
    popular: false,
  },
  {
    id: "5months",
    name: "Półroczny",
    price: "20",
    period: "/ 6 miesięcy",
    duration: "6 miesięcy",
    description: "Najczęściej wybierany",
    pricePerMonth: "3,33",
    popular: true,
  },
  {
    id: "12months",
    name: "Roczny",
    price: "30",
    period: "/ 12 miesięcy",
    duration: "12 miesięcy",
    description: "Najlepsza opłacalność",
    pricePerMonth: "2,50",
    popular: false,
  },
];

const features = [
  {
    icon: Bike,
    title: "Do 10 rowerów",
    description:
      "Dodaj i śledź do 10 rowerów na jednym koncie zamiast jednego w planie darmowym.",
  },
  {
    icon: BarChart3,
    title: "Statystyki i wykresy",
    description:
      "Szczegółowe wykresy przebiegu, zużycia części i historii serwisów.",
  },
  {
    icon: FileDown,
    title: "Eksport do PDF",
    description:
      "Eksportuj pełną historię serwisu i stan części do pliku PDF.",
  },
  {
    icon: Bell,
    title: "Priorytetowe powiadomienia",
    description:
      "Wyprzedzające alerty o zbliżających się wymianach i przeglądach.",
  },
  {
    icon: GitCompareArrows,
    title: "Porównywarka produktów",
    description:
      "Porównuj części i akcesoria obok siebie — ceny, recenzje, trwałość.",
  },
];

type Plan = (typeof plans)[number];

export default function UpgradePage() {
  const { update } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setConfirmed(false);
    setDialogOpen(true);
  }

  async function handleConfirm() {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExpiresAt(data.planExpiresAt);
      setConfirmed(true);
      // Odśwież sesję żeby zaktualizować plan w całej aplikacji
      await update();
      router.refresh();
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 lg:px-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Crown className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Premium</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Odblokuj pełen potencjał MBikea i zarządzaj swoimi rowerami jak
          profesjonalista.
        </p>
      </div>


      {/* Pricing */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-6">
          Wybierz plan
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-shadow hover:shadow-lg ${
                plan.popular
                  ? "ring-2 ring-primary relative"
                  : "hover:ring-2 hover:ring-primary/50 relative"
              }`}
              onClick={() => handleSelectPlan(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                  <Badge>Popularny</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex-1">
                <div className="mb-1">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.period}</p>
                {plan.pricePerMonth && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ({plan.pricePerMonth}€ / miesiąc)
                  </p>
                )}
                <ul className="mt-4 space-y-2 text-sm text-left">
                  {features.map((f) => (
                    <li key={f.title} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{f.title}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Wybierz {plan.name.toLowerCase()}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Free plan comparison */}
      <div className="text-center text-sm text-muted-foreground pb-4">
        <p>
          Plan darmowy pozwala na śledzenie{" "}
          <strong>1 roweru</strong> z podstawowymi funkcjami.
        </p>
      </div>

      {/* Features */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {!confirmed ? (
            <>
              <DialogHeader>
                <DialogTitle>Potwierdzenie planu</DialogTitle>
                <DialogDescription>
                  Sprawdź szczegóły wybranego planu przed zakupem.
                </DialogDescription>
              </DialogHeader>

              {selectedPlan && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">
                        Plan {selectedPlan.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlan.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {selectedPlan.price}€
                      </p>
                      {selectedPlan.pricePerMonth && (
                        <p className="text-xs text-muted-foreground">
                          {selectedPlan.pricePerMonth}€ / mies.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      W planie Premium otrzymujesz:
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {features.map((f) => (
                        <li key={f.title} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>{f.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Anuluj
                </Button>
                <Button onClick={handleConfirm} disabled={loading}>
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loading ? "Przetwarzanie..." : "Kupuję Premium"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Dziękujemy!</DialogTitle>
                <DialogDescription>
                  Twój plan Premium został aktywowany.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center py-6 gap-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Plan <strong>{selectedPlan?.name}</strong> na{" "}
                  <strong>{selectedPlan?.duration}</strong> jest teraz aktywny.
                  Ciesz się pełnym dostępem do MBikea!
                </p>
                {expiresAt && (
                  <p className="text-center text-xs text-muted-foreground">
                    Premium ważny do:{" "}
                    <strong>
                      {new Date(expiresAt).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>
                  Zamknij
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
