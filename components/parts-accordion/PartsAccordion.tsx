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
import CustomPartCard from "./CustomPartCard";
import AddCustomPartCard from "./AddCustomPartCard";
import {
  PART_CATEGORIES,
  PartCategory,
  getPartCategory,
  getPartNameForBike,
  getHiddenPartsByBrakeType,
  extractBrakeType,
  getHiddenPartsByTubelessStatus,
  extractTubelessStatus,
  extractForkType,
  getHiddenPartsByForkType,
  TOGGLEABLE_PARTS,
} from "@/lib/default-parts";
import { PartReplacement, BikePartWithProduct } from "@/lib/types";
import type { PartsDisplayOrder } from "@/app/app/actions/parts-display-order";
import PartsOrderDialog from "./PartsOrderDialog";

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

export type CustomPartData = {
  id: string;
  name: string;
  category: string;
  wearKm: number;
  expectedKm: number;
  brand?: string | null;
  model?: string | null;
  installedAt?: Date | string | null;
};

interface PartsAccordionProps {
  bikeId: string;
  bikeType?: BikeType;
  defaultParts: DefaultPart[];
  existingParts: ExistingPart[];
  customParts?: CustomPartData[];
  chainChildren?: React.ReactNode;
  tireFrontChildren?: React.ReactNode;
  tireRearChildren?: React.ReactNode;
  partsDisplayOrder?: PartsDisplayOrder | null;
}

export default function PartsAccordion({
  bikeId,
  bikeType,
  defaultParts,
  existingParts,
  customParts = [],
  chainChildren,
  tireFrontChildren,
  tireRearChildren,
  partsDisplayOrder,
}: PartsAccordionProps) {
  // Grupuj części według kategorii (z filtrowaniem wg typu hamulców)
  const partsByCategory = React.useMemo(() => {
    const brakeType = extractBrakeType(existingParts);
    const hiddenByBrake = getHiddenPartsByBrakeType(brakeType);
    const tubelessStatus = extractTubelessStatus(existingParts);
    const hiddenByTubeless = getHiddenPartsByTubelessStatus(tubelessStatus);
    const forkType = extractForkType(existingParts);
    const hiddenByFork = getHiddenPartsByForkType(forkType);
    const hiddenParts = new Set([...hiddenByBrake, ...hiddenByTubeless, ...hiddenByFork]);

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

    // Sortuj części wg niestandardowej kolejności (jeśli ustawiona)
    if (partsDisplayOrder?.parts) {
      for (const cat of Object.keys(categories) as PartCategory[]) {
        const customPartOrder = partsDisplayOrder.parts[cat];
        if (customPartOrder) {
          categories[cat].sort((a, b) => {
            const aIdx = customPartOrder.indexOf(a.partType as string);
            const bIdx = customPartOrder.indexOf(b.partType as string);
            // Części spoza listy trafiają na koniec
            return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
          });
        }
      }
    } else {
      // Domyślne sortowanie gdy brak niestandardowej kolejności
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
    }

    return categories;
  }, [defaultParts, existingParts, bikeType, partsDisplayOrder]);

  // Grupuj custom parts wg kategorii
  const customPartsByCategory = React.useMemo(() => {
    const grouped: Record<PartCategory, CustomPartData[]> = {
      frame: [],
      drivetrain: [],
      brakes: [],
      wheels: [],
      cockpit: [],
      accessories: [],
    };
    for (const cp of customParts) {
      if (cp.category in grouped) {
        grouped[cp.category as PartCategory].push(cp);
      }
    }
    return grouped;
  }, [customParts]);

  // Scal standardowe i custom parts w jedną posortowaną listę per kategoria
  type MergedItem =
    | { kind: "standard"; partType: PartType; expectedKm: number; existingPart?: ExistingPart }
    | { kind: "custom"; part: CustomPartData };

  const mergedPartsByCategory = React.useMemo(() => {
    const result = {} as Record<PartCategory, MergedItem[]>;
    for (const cat of Object.keys(partsByCategory) as PartCategory[]) {
      const standard: MergedItem[] = partsByCategory[cat].map((p) => ({
        kind: "standard",
        partType: p.partType,
        expectedKm: p.expectedKm,
        existingPart: p.existingPart,
      }));
      const custom: MergedItem[] = (customPartsByCategory[cat] ?? []).map((cp) => ({
        kind: "custom",
        part: cp,
      }));
      const savedOrder = partsDisplayOrder?.parts?.[cat];
      if (savedOrder) {
        const all = [...standard, ...custom];
        all.sort((a, b) => {
          const aId = a.kind === "standard" ? (a.partType as string) : a.part.id;
          const bId = b.kind === "standard" ? (b.partType as string) : b.part.id;
          const aIdx = savedOrder.indexOf(aId);
          const bIdx = savedOrder.indexOf(bId);
          return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
        });
        result[cat] = all;
      } else {
        result[cat] = [...standard, ...custom];
      }
    }
    return result;
  }, [partsByCategory, customPartsByCategory, partsDisplayOrder]);

  // Filtruj puste kategorie (uwzględniając custom parts) z zachowaniem kolejności
  const allCategories = partsDisplayOrder?.categories ?? (Object.keys(partsByCategory) as PartCategory[]);
  const nonEmptyCategories = allCategories.filter(
    (cat) => (partsByCategory[cat]?.length ?? 0) > 0 || (customPartsByCategory[cat]?.length ?? 0) > 0
  );

  // Zapamiętaj stan otwarcia/zamknięcia kategorii w sessionStorage per rower.
  // sessionStorage czyści się przy zamknięciu przeglądarki/karty → domyślnie wszystko otwarte.
  const storageKey = `accordion-open-${bikeId}`;

  const [openCategories, setOpenCategories] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return nonEmptyCategories;
    try {
      const saved = sessionStorage.getItem(storageKey);
      // Brak zapisu = pierwsza wizyta w sesji → wszystkie kategorie otwarte
      if (saved === null) return nonEmptyCategories;
      const parsed: string[] = JSON.parse(saved);
      // Zachowaj tylko kategorie które nadal istnieją (mogły zniknąć po zmianie roweru)
      return parsed.filter((cat) => (nonEmptyCategories as string[]).includes(cat));
    } catch {
      return nonEmptyCategories;
    }
  });

  function handleAccordionChange(values: string[]) {
    setOpenCategories(values);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      // sessionStorage niedostępny (prywatna karta, pełny storage itp.)
    }
  }

  // Animacja reorderingu kategorii: bezpośrednia manipulacja DOM przez ref,
  // żeby uniknąć konfliktu framer-motion layout z CSS animacją akordeonu.
  const categoryWrapperRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  const prevOrderRef = React.useRef(nonEmptyCategories.join(","));

  React.useEffect(() => {
    const currentOrder = nonEmptyCategories.join(",");
    if (currentOrder === prevOrderRef.current) return;
    prevOrderRef.current = currentOrder;

    nonEmptyCategories.forEach((cat, index) => {
      const el = categoryWrapperRefs.current.get(cat);
      if (!el) return;
      // Restart animacji: usuń, wymuś reflow, dodaj ponownie
      el.style.animation = "none";
      void el.offsetHeight;
      el.style.animation = `reorder-appear 0.35s ease-out ${index * 45}ms both`;
    });
  }, [nonEmptyCategories]);

  // Animacja reorderingu części wewnątrz kategorii
  const partItemRefs = React.useRef<Map<string, Map<string, HTMLDivElement>>>(new Map());
  const prevPartOrderRef = React.useRef<Map<string, string>>(new Map());

  React.useEffect(() => {
    for (const cat of Object.keys(mergedPartsByCategory) as PartCategory[]) {
      const items = mergedPartsByCategory[cat];
      const currentOrder = items.map((i) => i.kind === "standard" ? (i.partType as string) : i.part.id).join(",");
      const prevOrder = prevPartOrderRef.current.get(cat);

      if (prevOrder === undefined) {
        // Pierwsze renderowanie – tylko inicjalizacja, bez animacji
        prevPartOrderRef.current.set(cat, currentOrder);
        continue;
      }
      if (currentOrder === prevOrder) continue;
      prevPartOrderRef.current.set(cat, currentOrder);

      items.forEach((item, index) => {
        const id = item.kind === "standard" ? (item.partType as string) : item.part.id;
        const el = partItemRefs.current.get(cat)?.get(id);
        if (!el) return;
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = `reorder-appear 0.3s ease-out ${index * 30}ms both`;
      });
    }
  }, [mergedPartsByCategory]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <PartsOrderDialog
          currentOrder={partsDisplayOrder ?? null}
          visibleParts={partsByCategory}
          customParts={customPartsByCategory}
        />
      </div>
      <Accordion
        type="multiple"
        value={openCategories}
        onValueChange={handleAccordionChange}
      >
      {nonEmptyCategories.map((category) => {
        const mergedParts = mergedPartsByCategory[category];

        return (
          <div
            key={category}
            className="mb-2"
            ref={(el) => {
              if (el) categoryWrapperRefs.current.set(category, el);
              else categoryWrapperRefs.current.delete(category);
            }}
          >
            <AccordionItem value={category} className="border rounded-lg px-4">
              <AccordionTrigger className="text-lg font-semibold">
                {PART_CATEGORIES[category].label}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {mergedParts.map((item) => {
                    const partId = item.kind === "standard" ? (item.partType as string) : item.part.id;
                    return (
                      <div
                        key={partId}
                        ref={(el) => {
                          if (!partItemRefs.current.has(category)) {
                            partItemRefs.current.set(category, new Map());
                          }
                          const catMap = partItemRefs.current.get(category)!;
                          if (el) catMap.set(partId, el);
                          else catMap.delete(partId);
                        }}
                      >
                        {item.kind === "standard" ? (
                          <PartCard
                            partId={item.existingPart?.id || ""}
                            partName={getPartNameForBike(item.partType, bikeType, item.existingPart?.partSpecificData)}
                            expectedKm={item.expectedKm}
                            wearKm={item.existingPart?.wearKm || 0}
                            bikeId={bikeId}
                            partType={item.partType}
                            replacements={item.existingPart?.replacements || []}
                            currentBrand={
                              item.existingPart?.product?.brand ||
                              item.existingPart?.replacements?.[0]?.brand
                            }
                            currentModel={
                              item.existingPart?.product?.model ||
                              item.existingPart?.replacements?.[0]?.model
                            }
                            currentPart={item.existingPart as BikePartWithProduct | undefined}
                            isAccessory={category === "accessories" || TOGGLEABLE_PARTS.has(item.partType)}
                            isInstalled={item.existingPart?.isInstalled ?? (category !== "accessories")}
                            createdAt={item.existingPart?.createdAt}
                            bikeType={bikeType}
                          >
                            {item.partType === PartType.CHAIN ? chainChildren :
                             item.partType === PartType.TIRE_FRONT ? tireFrontChildren :
                             item.partType === PartType.TIRE_REAR ? tireRearChildren : null}
                          </PartCard>
                        ) : (
                          <CustomPartCard
                            id={item.part.id}
                            name={item.part.name}
                            wearKm={item.part.wearKm}
                            expectedKm={item.part.expectedKm}
                            brand={item.part.brand}
                            model={item.part.model}
                            installedAt={item.part.installedAt}
                          />
                        )}
                      </div>
                    );
                  })}

                  <AddCustomPartCard bikeId={bikeId} category={category} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        );
      })}
      </Accordion>
    </div>
  );
}
