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
  TOGGLEABLE_PARTS,
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
  images?: string[];
};

interface PartsAccordionProps {
  bikeId: string;
  bikeType?: BikeType;
  defaultParts: DefaultPart[];
  existingParts: ExistingPart[];
  chainChildren?: React.ReactNode;
  tireFrontChildren?: React.ReactNode;
  tireRearChildren?: React.ReactNode;
}

export default function PartsAccordion({
  bikeId,
  bikeType,
  defaultParts,
  existingParts,
  chainChildren,
  tireFrontChildren,
  tireRearChildren,
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

    // Sortuj toggleable parts w pozostałych kategoriach (zamontowane najpierw)
    for (const cat of Object.keys(categories) as PartCategory[]) {
      if (cat === "accessories") continue;
      const hasToggleable = categories[cat].some((p) => TOGGLEABLE_PARTS.has(p.partType));
      if (hasToggleable) {
        categories[cat].sort((a, b) => {
          const aToggleable = TOGGLEABLE_PARTS.has(a.partType);
          const bToggleable = TOGGLEABLE_PARTS.has(b.partType);
          if (!aToggleable && !bToggleable) return 0;
          if (!aToggleable) return -1;
          if (!bToggleable) return 1;
          const aInstalled = a.existingPart?.isInstalled ?? true;
          const bInstalled = b.existingPart?.isInstalled ?? true;
          if (aInstalled === bInstalled) return 0;
          return aInstalled ? -1 : 1;
        });
      }
    }

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
                  isAccessory={category === "accessories" || TOGGLEABLE_PARTS.has(partType)}
                  isInstalled={existingPart?.isInstalled ?? (category !== "accessories")}
                  createdAt={existingPart?.createdAt}
                  bikeType={bikeType}
                >
                  {partType === PartType.CHAIN ? chainChildren :
                   partType === PartType.TIRE_FRONT ? tireFrontChildren :
                   partType === PartType.TIRE_REAR ? tireRearChildren : null}
                </PartCard>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
