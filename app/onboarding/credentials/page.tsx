// app/onboarding/credentials/page.tsx
"use client";

import { useState } from "react";
import { createBike } from "../_actions/createBike";
import BikeTypeSelector from "../_components/BikeTypeSelector";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BikeType } from "@/lib/generated/prisma";

export default function CredentialsOnboardingPage() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  async function handleTypeSelect(type: BikeType) {
    await createBike({
      type,
      brand: brand || null,
      model: model || null,
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Witaj! 🚴</CardTitle>
          <CardDescription className="text-base">
            Podaj informacje o swoim rowerze, a automatycznie dodamy odpowiednie
            komponenty do śledzenia.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <BikeBrandModelFields
            brand={brand}
            model={model}
            onBrandChange={setBrand}
            onModelChange={setModel}
            onProductSelect={() => {}}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Typ roweru</p>
            <BikeTypeSelector onSelectType={handleTypeSelect} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
