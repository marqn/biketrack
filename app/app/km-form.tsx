"use client";

import {
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { updateBikeKm } from "./actions/update-bike-km";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";

type Props = {
  bikeId: string;
  initialKm: number;
};

export default function KmForm({ bikeId, initialKm }: Props) {
  const [isPending, startTransition] = useTransition();

  const [optimisticKm, setOptimisticKm] = useOptimistic(
    initialKm,
    (_, newKm: number) => newKm
  );

  const [inputKm, setInputKm] = useState(optimisticKm);

  // Synchronizuj inputKm gdy zmieni się rower (nowe initialKm)
  useEffect(() => {
    setInputKm(initialKm);
  }, [initialKm]);

  async function action(formData: FormData) {
    const newKm = Number(formData.get("newKm"));
    const prevKm = optimisticKm;

    startTransition(() => {
      setOptimisticKm(newKm);
    });

    await updateBikeKm(formData);

    toast.success(`Zapisano przebieg: ${newKm.toLocaleString("pl-PL")} km`, {
      description: prevKm !== newKm
        ? `Zmiana: ${prevKm.toLocaleString("pl-PL")} → ${newKm.toLocaleString("pl-PL")} km`
        : undefined,
    });
  }
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const incrementKm = (amount: number) => {
    setInputKm((prev) => Math.max(0, prev + amount));
  };

  const startHold = useCallback((amount: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    incrementKm(amount);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setInputKm((prev) => Math.max(0, prev + amount));
      }, 50);
    }, 300);
  }, []);

  const stopHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return (
    <Card className="mt-4 mx-auto max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-center">🚲 Aktualny przebieg roweru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form action={action} className="flex flex-col gap-3 p-6 pt-0">
          <input type="hidden" name="bikeId" value={bikeId} />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onMouseDown={() => startHold(-10)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(-10)}
              onTouchEnd={stopHold}
              disabled={isPending || inputKm <= 0}
              className="shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onMouseDown={() => startHold(-1)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(-1)}
              onTouchEnd={stopHold}
              disabled={isPending || inputKm <= 0}
              className="shrink-0"
            >
              <span className="text-lg">−</span>
            </Button>

            <Input
              name="newKm"
              value={inputKm}
              onChange={(e) => setInputKm(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              disabled={isPending}
              className="flex-1 text-center"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              onMouseDown={() => startHold(1)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(1)}
              onTouchEnd={stopHold}
              disabled={isPending}
              className="shrink-0"
            >
              <span className="text-lg">+</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onMouseDown={() => startHold(10)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(10)}
              onTouchEnd={stopHold}
              disabled={isPending}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button disabled={isPending} variant="outline">
            {isPending ? "Zapisuję..." : "💾 Zapisz km"}
          </Button>
          <span className="text-center">
            Aktualnie zapisane: {optimisticKm} km
          </span>
        </form>
      </CardContent>
    </Card>
  );
}
