"use client";

import * as React from "react";
import { PartType } from "@/lib/generated/prisma";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PartCard from "@/components/part-card/PartCard";
import {
  PART_CATEGORIES,
  PART_UI,
  PartCategory,
  getPartCategory,
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
};

interface PartsAccordionProps {
  bikeId: string;
  defaultParts: DefaultPart[];
  existingParts: ExistingPart[];
  chainChildren?: React.ReactNode;
}

export default function PartsAccordion({
  bikeId,
  defaultParts,
  existingParts,
  chainChildren,
}: PartsAccordionProps) {
  // Grupuj części według kategorii
  const partsByCategory = React.useMemo(() => {
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
                  partName={PART_UI[partType]}
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
