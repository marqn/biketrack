"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { replacePart } from "./actions/replace-part";
import { PartType } from "@/lib/generated/prisma";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ColoredProgress from "@/components/ui/colored-progress";

export default function PartCard({
  partName,
  wearKm,
  expectedKm,
  bikeId,
  partType,
  children,
}: {
  partName: string;
  wearKm: number;
  expectedKm: number;
  bikeId: string;
  partType: PartType;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const progressPercent = Math.min(
    Math.round((wearKm / expectedKm) * 100),
    100
  );

  function handleReplace() {
    const formData = new FormData();
    formData.set("bikeId", bikeId);
    formData.set("partType", partType);

    startTransition(async () => {
      await replacePart(formData);
      router.refresh();
    });
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{partName}</CardTitle>
        {progressPercent >= 100 && <CardAction>🚨</CardAction>}
      </CardHeader>

      <CardContent className="space-y-3">
        <ColoredProgress value={progressPercent} />

        <div className="text-sm text-muted-foreground items-center flex justify-between">
          <span>
            Zużycie:{" "}
            <span className="font-medium text-foreground">{wearKm}</span>
            {" km "}/ {expectedKm} km
          </span>

          <Button
            size={"sm"}
            variant="outline"
            onClick={handleReplace}
            disabled={isPending}
          >
            {isPending ? "Wymieniam..." : "🔄 Wymień"}
          </Button>
        </div>
      </CardContent>

      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
