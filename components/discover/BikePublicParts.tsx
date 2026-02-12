"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BikeType, PartType } from "@/lib/generated/prisma";
import { PART_CATEGORIES, PART_ICONS, type PartCategory, getPartNameForBike, getHiddenPartsByBrakeType, extractBrakeType, getHiddenPartsByTubelessStatus, extractTubelessStatus } from "@/lib/default-parts";

interface BikePublicPartsProps {
  bikeType?: BikeType;
  parts: Array<{
    id: string;
    type: PartType;
    wearKm: number;
    expectedKm: number;
    isInstalled: boolean;
    partSpecificData?: unknown;
    product: {
      id: string;
      brand: string;
      model: string;
      type: string;
      averageRating: number | null;
      totalReviews: number;
    } | null;
  }>;
}

export function BikePublicParts({ parts, bikeType }: BikePublicPartsProps) {
  if (parts.length === 0) return null;

  // Filtruj części wg typu hamulców i tubeless
  const brakeType = extractBrakeType(parts);
  const hiddenByBrake = getHiddenPartsByBrakeType(brakeType);
  const tubelessStatus = extractTubelessStatus(parts);
  const hiddenByTubeless = getHiddenPartsByTubelessStatus(tubelessStatus);
  const hiddenParts = new Set([...hiddenByBrake, ...hiddenByTubeless]);
  const visibleParts = parts.filter((p) => !hiddenParts.has(p.type));

  // Pogrupuj części według kategorii
  const partsByCategory = new Map<PartCategory, typeof parts>();

  for (const part of visibleParts) {
    for (const [category, data] of Object.entries(PART_CATEGORIES)) {
      if (data.types.includes(part.type)) {
        const existing = partsByCategory.get(category as PartCategory) || [];
        existing.push(part);
        partsByCategory.set(category as PartCategory, existing);
        break;
      }
    }
  }

  return (
    <div className="bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Komponenty</h2>

      <div className="space-y-6">
        {Array.from(partsByCategory.entries()).map(([category, categoryParts]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {PART_CATEGORIES[category].label}
            </h3>
            <div className="space-y-2">
              {categoryParts.map((part) => {
                const wearPercent = Math.min(
                  Math.round((part.wearKm / part.expectedKm) * 100),
                  100
                );
                const isWorn = wearPercent >= 100;
                const isNearWorn = wearPercent >= 80;

                return (
                  <div
                    key={part.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-lg w-7 shrink-0 text-center">
                      {PART_ICONS[part.type] || ""}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {getPartNameForBike(part.type, bikeType, part.partSpecificData)}
                        </span>
                        {part.product && (
                          <span className="text-xs text-muted-foreground truncate">
                            {part.product.brand} {part.product.model}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress
                          value={wearPercent}
                          className="h-1.5 flex-1"
                        />
                        <span
                          className={`text-xs font-medium shrink-0 ${
                            isWorn
                              ? "text-destructive"
                              : isNearWorn
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {wearPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground shrink-0">
                      {part.wearKm.toLocaleString("pl-PL")} km
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
