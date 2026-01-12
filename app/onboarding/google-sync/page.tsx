"use client";

import { useTransition } from "react";
import { BikeType } from "@/lib/generated/prisma";
import { createBike } from "./actions";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { bikeTypeLabels } from "@/lib/types";

const GooglePage: React.FC = () => {
  const [, startTransition] = useTransition();

  function handleSelect(type: BikeType) {
    startTransition(async () => {
      await createBike(type);
    });
  }
  

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Witaj</CardTitle>
          <CardTitle className="text-2xl">Jaki masz rower ? 🚲</CardTitle>
          <CardDescription className="text-base">
            Wybierz typ roweru, a automatycznie dodamy odpowiednie komponenty do
            śledzenia.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ToggleGroup
            type="single"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto"
          >
            {Object.values(BikeType).map((type) => (
              <ToggleGroupItem
                key={type}
                value={type}
                onClick={() => handleSelect(type)}
                className="h-20 text-lg flex items-center justify-center text-center rounded-xl"
              >
                {bikeTypeLabels[type]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>
    </main>
  );
};

export default GooglePage;
