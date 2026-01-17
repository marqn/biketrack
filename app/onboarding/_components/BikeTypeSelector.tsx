// app/onboarding/_components/BikeTypeSelector.tsx
"use client";

import { useTransition } from "react";
import { BikeType } from "@/lib/generated/prisma";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { bikeTypeLabels } from "@/lib/types";

interface BikeTypeSelectorProps {
  onSelectType: (type: BikeType) => Promise<void>;
  disabled?: boolean;
}

export default function BikeTypeSelector({
  onSelectType,
  disabled = false,
}: BikeTypeSelectorProps) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(type: BikeType) {
    startTransition(async () => {
      await onSelectType(type);
    });
  }

  return (
    <>
      {!isPending && (
        <ToggleGroup
          type="single"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          disabled={disabled || isPending}
        >
          {Object.values(BikeType).map((type) => (
            <ToggleGroupItem
              key={type}
              value={type}
              onClick={() => handleSelect(type)}
              className="h-20 text-lg flex items-center justify-center text-center rounded-xl disabled:opacity-50"
            >
              {bikeTypeLabels[type]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      {isPending && (
        <p className="text-center text-lg text-muted-foreground mt-4">
          Tworzenie roweru...
        </p>
      )}
    </>
  );
}
