"use client";

import * as React from "react";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Gauge,
  FlaskConical,
  Droplets,
  Settings2,
  Cable,
  CircleDot,
  Wrench,
  CircleAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ColoredProgress from "@/components/ui/colored-progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MAINTENANCE_ITEMS,
  computeMaintenanceStatus,
  type MaintenanceType,
  type MaintenanceStatus,
} from "@/lib/maintenance-config";
import { markMaintenanceDone } from "@/app/app/actions/maintenance/mark-maintenance-done";
import { toggleMaintenanceVisibility } from "@/app/app/actions/maintenance/toggle-maintenance-visibility";
import { MaintenanceType as PrismaMaintenanceType } from "@/lib/generated/prisma";
import LubeButton from "@/app/app/lube-button";
import { CHAIN_LUBE_INTERVAL_KM } from "@/lib/default-parts";
import { LubeEvent } from "@/lib/types";

const ICON_MAP: Record<string, React.ElementType> = {
  Gauge,
  FlaskConical,
  Droplets,
  Settings2,
  Cable,
  CircleDot,
  Wrench,
  CircleAlert,
};

const STATUS_BADGE: Record<MaintenanceStatus, React.ReactNode> = {
  ok: (
    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
      OK
    </Badge>
  ),
  warning: (
    <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
      Wkrótce
    </Badge>
  ),
  overdue: (
    <Badge variant="destructive" className="text-xs">
      Wymagane
    </Badge>
  ),
  never: (
    <Badge variant="outline" className="text-muted-foreground text-xs">
      Nigdy
    </Badge>
  ),
};

export interface MaintenanceLogEntry {
  type: string;
  kmAtTime: number;
  createdAt: Date | string;
}

export interface MaintenancePanelProps {
  bikeId: string;
  currentKm: number;
  lastLogs: MaintenanceLogEntry[];
  hiddenItems: string[];
  /** Opcjonalna kolejność pozycji (z partsDisplayOrder.parts.maintenance) */
  itemOrder?: string[];
  /** Dane do sekcji smarowania łańcucha */
  chainLubeData?: {
    lastLubeKmInitial?: number | null;
    lubeEvents?: LubeEvent[];
  };
}

function formatStatusLabel(
  daysAgo: number | null,
  kmAgo: number | null,
  hasIntervalKm: boolean,
  hasIntervalDays: boolean
): string {
  if (daysAgo === null && kmAgo === null) return "Nigdy";

  const parts: string[] = [];
  if (hasIntervalDays && daysAgo !== null) {
    parts.push(`${daysAgo} dni temu`);
  }
  if (hasIntervalKm && kmAgo !== null) {
    parts.push(`${kmAgo} km temu`);
  }
  return parts.join(" / ") || `${daysAgo} dni temu`;
}

/** Zawartość panelu konserwacji — bez wrappera akordeonu */
export default function MaintenancePanelContent({
  bikeId,
  currentKm,
  lastLogs,
  hiddenItems,
  itemOrder,
  chainLubeData,
}: MaintenancePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticLogs, addOptimisticLog] = useOptimistic(
    lastLogs,
    (state, newLog: MaintenanceLogEntry) => {
      const filtered = state.filter((l) => l.type !== newLog.type);
      return [...filtered, newLog];
    }
  );

  const [optimisticHidden, updateOptimisticHidden] = useOptimistic(
    hiddenItems,
    (state, { type, hidden }: { type: string; hidden: boolean }) =>
      hidden ? [...state, type] : state.filter((t) => t !== type)
  );

  function handleMarkDone(type: MaintenanceType) {
    startTransition(async () => {
      addOptimisticLog({ type, kmAtTime: currentKm, createdAt: new Date() });
      await markMaintenanceDone(bikeId, type as PrismaMaintenanceType);
      router.refresh();
    });
  }

  function handleToggleVisibility(type: MaintenanceType, hidden: boolean) {
    startTransition(async () => {
      updateOptimisticHidden({ type, hidden });
      await toggleMaintenanceVisibility(bikeId, type, hidden);
      router.refresh();
    });
  }

  type VisibleEntry =
    | { kind: "chain_lube" }
    | { kind: "maintenance"; config: (typeof MAINTENANCE_ITEMS)[number] };

  // Zunifikowana lista widocznych pozycji (konserwacja + smarowanie) z respektowaniem itemOrder
  const allVisibleEntries = React.useMemo((): VisibleEntry[] => {
    const maintByType = new Map(MAINTENANCE_ITEMS.map((i) => [i.type, i]));

    if (!itemOrder?.length) {
      const result: VisibleEntry[] = [];
      if (chainLubeData) result.push({ kind: "chain_lube" });
      for (const config of MAINTENANCE_ITEMS) {
        if (!optimisticHidden.includes(config.type))
          result.push({ kind: "maintenance", config });
      }
      return result;
    }

    const result: VisibleEntry[] = [];
    const usedTypes = new Set<string>();

    for (const id of itemOrder) {
      if (id === "CHAIN_LUBE") {
        if (chainLubeData) result.push({ kind: "chain_lube" });
      } else {
        const config = maintByType.get(id as MaintenanceType);
        if (config && !optimisticHidden.includes(config.type)) {
          result.push({ kind: "maintenance", config });
          usedTypes.add(config.type);
        }
      }
    }
    // Dołącz pozycje konserwacji spoza itemOrder
    for (const config of MAINTENANCE_ITEMS) {
      if (!usedTypes.has(config.type) && !optimisticHidden.includes(config.type)) {
        result.push({ kind: "maintenance", config });
      }
    }
    // Jeśli CHAIN_LUBE nie ma w itemOrder, dodaj na początku
    if (chainLubeData && !itemOrder.includes("CHAIN_LUBE")) {
      result.unshift({ kind: "chain_lube" });
    }
    return result;
  }, [itemOrder, chainLubeData, optimisticHidden]);

  const hiddenItemConfigs = React.useMemo(() => {
    const sorted = itemOrder?.length
      ? [...MAINTENANCE_ITEMS].sort((a, b) => {
          const ai = itemOrder.indexOf(a.type);
          const bi = itemOrder.indexOf(b.type);
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        })
      : MAINTENANCE_ITEMS;
    return sorted.filter((item) => optimisticHidden.includes(item.type));
  }, [itemOrder, optimisticHidden]);

  return (
    <div className="space-y-3 py-1">
      {allVisibleEntries.map((entry) => {
        if (entry.kind === "chain_lube") {
          return (
            <div key="CHAIN_LUBE" className="space-y-1.5 pb-3 border-b">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Droplets className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">Smarowanie łańcucha</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  co {CHAIN_LUBE_INTERVAL_KM} km
                </span>
              </div>
              <LubeButton
                bikeId={bikeId}
                currentKm={currentKm}
                lastLubeKmInitial={chainLubeData!.lastLubeKmInitial}
                lubeEvents={chainLubeData!.lubeEvents}
              />
            </div>
          );
        }

        const { config } = entry;
        const lastLog = optimisticLogs.find((l) => l.type === config.type) ?? null;
        const itemStatus = computeMaintenanceStatus(config, lastLog, currentKm);
        const Icon = ICON_MAP[config.icon] ?? Wrench;

        return (
          <div
            key={config.type}
            className="space-y-1.5 pb-3 border-b last:border-b-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">{config.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {STATUS_BADGE[itemStatus.status]}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  disabled={isPending}
                  onClick={() => handleMarkDone(config.type as MaintenanceType)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Gotowe
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground"
                  disabled={isPending}
                  onClick={() => handleToggleVisibility(config.type as MaintenanceType, true)}
                  title="Ukryj"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {itemStatus.status === "never" && itemStatus.kmAgo === null
                  ? "Nigdy nie wykonano"
                  : formatStatusLabel(
                      itemStatus.daysAgo,
                      itemStatus.kmAgo,
                      !!config.intervalKm,
                      !!config.intervalDays
                    )}
              </span>
              {config.intervalKm && (
                <span>
                  co {config.intervalKm} km
                  {config.intervalDays ? ` / ${config.intervalDays} dni` : ""}
                </span>
              )}
              {!config.intervalKm && config.intervalDays && (
                <span>co {config.intervalDays} dni</span>
              )}
            </div>

            <ColoredProgress value={itemStatus.progressPercent} />
          </div>
        );
      })}

      {hiddenItemConfigs.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1">
            <ChevronDown className="h-3.5 w-3.5" />
            {hiddenItemConfigs.length === 1
              ? "1 ukryty element"
              : `${hiddenItemConfigs.length} ukryte elementy`}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            {hiddenItemConfigs.map((config) => {
              const Icon = ICON_MAP[config.icon] ?? Wrench;
              return (
                <div
                  key={config.type}
                  className="flex items-center justify-between text-sm text-muted-foreground py-1"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{config.label}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    disabled={isPending}
                    onClick={() =>
                      handleToggleVisibility(config.type as MaintenanceType, false)
                    }
                    title="Pokaż"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
