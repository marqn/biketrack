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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
        <CardTitle className="text-base font-medium">
          {partName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Progress value={progressPercent} />

        <div className="text-sm text-muted-foreground">
          Zużycie:{" "}
          <span className="font-medium text-foreground">
            {wearKm}
          </span>{" "}
          / {expectedKm} km
        </div>

        {children}
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          variant="outline"
          onClick={handleReplace}
          disabled={isPending}
        >
          {isPending ? "Wymieniam..." : "🔄 Wymień"}
        </Button>
      </CardFooter>
    </Card>
  );
}
