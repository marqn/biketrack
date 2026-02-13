"use client";

import * as React from "react";
import { BikeType, PartType } from "@/lib/generated/prisma";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PartCard from "@/components/part-card/PartCard";
import {
  PART_CATEGORIES,
  PartCategory,
  getPartCategory,
  getPartNameForBike,
  getHiddenPartsByBrakeType,
  extractBrakeType,
  getHiddenPartsByTubelessStatus,
  extractTubelessStatus,
} from "@/lib/default-parts";
import { PartReplacement, BikePartWithProduct } from "@/lib/types";

type DefaultPart = {
  type: PartType;
  expectedKm: number;
};

type ExistingPart = {
  id: string;
  type: PartType;
  wearKm: number;
  expectedKm: number;
  isInstalled?: boolean;
  product?: { brand: string; model: string } | null;
  replacements: PartReplacement[];
  createdAt?: Date | string;
  installedAt?: Date | string | null;
  partSpecificData?: unknown;
};

interface PartsAccordionProps {
  bikeId: string;
  bikeType?: BikeType;
  defaultParts: DefaultPart[];
  existingParts: ExistingPart[];
  chainChildren?: React.ReactNode;
}

export default function PartsAccordion({
  bikeId,
  bikeType,
  defaultParts,
  existingParts,
  chainChildren,
}: PartsAccordionProps) {
  // Grupuj części według kategorii (z filtrowaniem wg typu hamulców)
  const partsByCategory = React.useMemo(() => {
    const brakeType = extractBrakeType(existingParts);
    const hiddenByBrake = getHiddenPartsByBrakeType(brakeType);
    const tubelessStatus = extractTubelessStatus(existingParts);
    const hiddenByTubeless = getHiddenPartsByTubelessStatus(tubelessStatus);
    const hiddenParts = new Set([...hiddenByBrake, ...hiddenByTubeless]);

    const categories: Record<
      PartCategory,
      Array<{
        partType: PartType;
        expectedKm: number;
        existingPart?: ExistingPart;
      }>
    > = {
      frame: [],
      drivetrain: [],
      brakes: [],
      wheels: [],
      cockpit: [],
      accessories: [],
    };

    // Dla każdej domyślnej części, znajdź kategorię i dodaj
    for (const defaultPart of defaultParts) {
      if (hiddenParts.has(defaultPart.type)) continue;

      const category = getPartCategory(defaultPart.type);
      if (category) {
        const existingPart = existingParts.find(
          (p) => p.type === defaultPart.type
        );
        categories[category].push({
          partType: defaultPart.type,
          expectedKm: defaultPart.expectedKm,
          existingPart,
        });
      }
    }

    // Sortuj akcesoria: zamontowane najpierw, potem nieaktywne
    categories.accessories.sort((a, b) => {
      const aInstalled = a.existingPart?.isInstalled ?? false;
      const bInstalled = b.existingPart?.isInstalled ?? false;
      if (aInstalled === bInstalled) return 0;
      return aInstalled ? -1 : 1;
    });

    return categories;
  }, [defaultParts, existingParts]);

  // Filtruj puste kategorie
  const nonEmptyCategories = Object.entries(partsByCategory).filter(
    ([, parts]) => parts.length > 0
  ) as [PartCategory, typeof partsByCategory[PartCategory]][];

  return (
    <Accordion
      type="multiple"
      defaultValue={nonEmptyCategories.map(([cat]) => cat)}
      className="space-y-2"
    >
      {nonEmptyCategories.map(([category, parts]) => (
        <AccordionItem key={category} value={category} className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            {PART_CATEGORIES[category].label}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {parts.map(({ partType, expectedKm, existingPart }) => (
                <PartCard
                  key={partType}
                  partId={existingPart?.id || ""}
                  partName={getPartNameForBike(partType, bikeType, existingPart?.partSpecificData)}
                  expectedKm={expectedKm}
                  wearKm={existingPart?.wearKm || 0}
                  bikeId={bikeId}
                  partType={partType}
                  replacements={existingPart?.replacements || []}
                  currentBrand={
                    existingPart?.product?.brand ||
                    existingPart?.replacements?.[0]?.brand
                  }
                  currentModel={
                    existingPart?.product?.model ||
                    existingPart?.replacements?.[0]?.model
                  }
                  currentPart={existingPart as BikePartWithProduct | undefined}
                  isAccessory={category === "accessories"}
                  isInstalled={existingPart?.isInstalled ?? (category !== "accessories")}
                  createdAt={existingPart?.createdAt}
                  bikeType={bikeType}
                >
                  {partType === PartType.CHAIN && chainChildren}
                </PartCard>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
