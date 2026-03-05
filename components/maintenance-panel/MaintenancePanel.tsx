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
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import NumberStepper from "@/components/ui/number-stepper";
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
  type MaintenanceItemConfig,
} from "@/lib/maintenance-config";
import { markMaintenanceDone } from "@/app/app/actions/maintenance/mark-maintenance-done";
import { toggleMaintenanceVisibility } from "@/app/app/actions/maintenance/toggle-maintenance-visibility";
import { updateMaintenanceInterval } from "@/app/app/actions/maintenance/update-maintenance-interval";
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

export type CustomIntervals = Record<string, { intervalKm?: number; intervalDays?: number }>;

export interface MaintenancePanelProps {
  bikeId: string;
  currentKm: number;
  lastLogs: MaintenanceLogEntry[];
  hiddenItems: string[];
  customIntervals?: CustomIntervals;
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

function mergeConfig(
  config: MaintenanceItemConfig,
  custom?: { intervalKm?: number; intervalDays?: number }
): MaintenanceItemConfig {
  if (!custom) return config;
  return {
    ...config,
    ...(custom.intervalKm != null ? { intervalKm: custom.intervalKm } : {}),
    ...(custom.intervalDays != null ? { intervalDays: custom.intervalDays } : {}),
  };
}

function IntervalEditor({
  bikeId,
  type,
  defaultIntervalKm,
  defaultIntervalDays,
  customKm,
  customDays,
}: {
  bikeId: string;
  type: MaintenanceType;
  defaultIntervalKm?: number;
  defaultIntervalDays?: number;
  customKm?: number;
  customDays?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [kmVal, setKmVal] = React.useState(customKm ?? defaultIntervalKm ?? 0);
  const [daysVal, setDaysVal] = React.useState(customDays ?? defaultIntervalDays ?? 0);
  const [saving, startSave] = useTransition();

  const effectiveKm = customKm ?? defaultIntervalKm;
  const effectiveDays = customDays ?? defaultIntervalDays;

  const label = [
    effectiveKm ? `co ${effectiveKm} km` : null,
    effectiveDays ? `${effectiveDays} dni` : null,
  ]
    .filter(Boolean)
    .join(" / ");

  function handleSave() {
    const km = kmVal > 0 ? kmVal : null;
    const days = daysVal > 0 ? daysVal : null;
    startSave(async () => {
      await updateMaintenanceInterval(bikeId, type, km, days);
      setOpen(false);
    });
  }

  function handleReset() {
    setKmVal(defaultIntervalKm ?? 0);
    setDaysVal(defaultIntervalDays ?? 0);
    startSave(async () => {
      await updateMaintenanceInterval(bikeId, type, null, null);
      setOpen(false);
    });
  }

  const hasCustom = customKm != null || customDays != null;
  const isMobile = useIsMobile();

  const trigger = (
    <button
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      title="Edytuj interwał"
      onClick={() => isMobile && setOpen(true)}
    >
      {label || "—"}
      <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
      {hasCustom && (
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" title="Zmodyfikowany interwał" />
      )}
    </button>
  );

  const content = (
    <div className="space-y-3">
      {defaultIntervalKm != null && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Co ile km</label>
          <NumberStepper
            value={kmVal}
            onChange={setKmVal}
            steps={[10, 100]}
            min={1}
            disabled={saving}
          />
        </div>
      )}
      {defaultIntervalDays != null && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Co ile dni</label>
          <NumberStepper
            value={daysVal}
            onChange={setDaysVal}
            steps={[1, 7]}
            min={1}
            disabled={saving}
          />
        </div>
      )}
      <div className="flex gap-1.5 pt-1">
        <Button size="sm" className="h-7 text-xs flex-1" onClick={handleSave} disabled={saving}>
          Zapisz
        </Button>
        {hasCustom && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleReset} disabled={saving} title="Przywróć domyślne">
            Reset
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edytuj interwał</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <p className="text-xs font-medium mb-2">Edytuj interwał</p>
        {content}
      </PopoverContent>
    </Popover>
  );
}

/** Zawartość panelu konserwacji — bez wrappera akordeonu */
export default function MaintenancePanelContent({
  bikeId,
  currentKm,
  lastLogs,
  hiddenItems,
  customIntervals = {},
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
          const chainLubeIntervalKm = customIntervals["CHAIN_LUBE"]?.intervalKm ?? CHAIN_LUBE_INTERVAL_KM;
          return (
            <div key="CHAIN_LUBE" className="space-y-1.5 pb-3 border-b">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Droplets className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">Smarowanie łańcucha</span>
                </div>
                <IntervalEditor
                  bikeId={bikeId}
                  type="CHAIN_LUBE"
                  defaultIntervalKm={CHAIN_LUBE_INTERVAL_KM}
                  customKm={customIntervals["CHAIN_LUBE"]?.intervalKm}
                />
              </div>
              <LubeButton
                bikeId={bikeId}
                currentKm={currentKm}
                lastLubeKmInitial={chainLubeData!.lastLubeKmInitial}
                lubeEvents={chainLubeData!.lubeEvents}
                lubeIntervalKm={chainLubeIntervalKm}
              />
            </div>
          );
        }

        const { config } = entry;
        const custom = customIntervals[config.type];
        const effectiveConfig = mergeConfig(config, custom);
        const lastLog = optimisticLogs.find((l) => l.type === config.type) ?? null;
        const itemStatus = computeMaintenanceStatus(effectiveConfig, lastLog, currentKm);
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
                  disabled={isPending || (itemStatus.progressPercent === 0 && itemStatus.status !== "never")}
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
                      !!effectiveConfig.intervalKm,
                      !!effectiveConfig.intervalDays
                    )}
              </span>
              <IntervalEditor
                bikeId={bikeId}
                type={config.type as MaintenanceType}
                defaultIntervalKm={config.intervalKm}
                defaultIntervalDays={config.intervalDays}
                customKm={custom?.intervalKm}
                customDays={custom?.intervalDays}
              />
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
