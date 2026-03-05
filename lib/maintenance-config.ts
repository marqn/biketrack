export type MaintenanceType =
  | "TIRE_PRESSURE"
  | "BIDON_WASH"
  | "BIKE_WASH"
  | "DRIVETRAIN_CLEAN"
  | "CABLE_CHECK"
  | "SPOKE_CHECK"
  | "BOLT_CHECK"
  | "TIRE_CONDITION"
  | "CHAIN_LUBE";

export type MaintenanceStatus = "ok" | "warning" | "overdue" | "never";

export interface MaintenanceItemConfig {
  type: MaintenanceType;
  label: string;
  icon: string; // nazwa ikony Lucide
  intervalKm?: number;
  intervalDays?: number;
  warningThreshold: number; // 0-1
}

export interface MaintenanceItemStatus {
  status: MaintenanceStatus;
  kmAgo: number | null;
  daysAgo: number | null;
  progressPercent: number; // 0-100
}

export const MAINTENANCE_ITEMS: MaintenanceItemConfig[] = [
  {
    type: "TIRE_PRESSURE",
    label: "Ciśnienie w oponach",
    icon: "Gauge",
    intervalDays: 14,
    intervalKm: 300,
    warningThreshold: 0.75,
  },
  {
    type: "BIDON_WASH",
    label: "Mycie bidonów",
    icon: "FlaskConical",
    intervalDays: 7,
    warningThreshold: 0.75,
  },
  {
    type: "BIKE_WASH",
    label: "Mycie roweru",
    icon: "Droplets",
    intervalDays: 30,
    intervalKm: 500,
    warningThreshold: 0.75,
  },
  {
    type: "DRIVETRAIN_CLEAN",
    label: "Czyszczenie napędu",
    icon: "Settings2",
    intervalKm: 300,
    warningThreshold: 0.75,
  },
  {
    type: "CABLE_CHECK",
    label: "Smarowanie linek",
    icon: "Cable",
    intervalKm: 1000,
    warningThreshold: 0.75,
  },
  {
    type: "SPOKE_CHECK",
    label: "Naprężenie szprych",
    icon: "CircleDot",
    intervalKm: 2000,
    warningThreshold: 0.75,
  },
  {
    type: "BOLT_CHECK",
    label: "Moment dokręcenia śrub",
    icon: "Wrench",
    intervalKm: 1000,
    warningThreshold: 0.75,
  },
  {
    type: "TIRE_CONDITION",
    label: "Stan opon",
    icon: "CircleAlert",
    intervalKm: 500,
    warningThreshold: 0.75,
  },
];

export function computeMaintenanceStatus(
  config: MaintenanceItemConfig,
  lastLog: { kmAtTime: number; createdAt: Date | string } | null,
  currentKm: number
): MaintenanceItemStatus {
  if (!lastLog) {
    // Dla pozycji z interwałem km liczymy postęp od km=0 (start roweru)
    if (config.intervalKm != null) {
      const kmProgress = (currentKm / config.intervalKm) * 100;
      const progressPercent = Math.min(Math.round(kmProgress), 100);
      const warningAt = config.warningThreshold * 100;
      const status: MaintenanceStatus =
        kmProgress >= 100 ? "overdue" : kmProgress >= warningAt ? "warning" : "never";
      return { status, kmAgo: currentKm, daysAgo: null, progressPercent };
    }
    // Brak interwału km (np. BIDON_WASH — tylko dni) — nie ma punktu odniesienia
    return { status: "never", kmAgo: null, daysAgo: null, progressPercent: 0 };
  }

  const kmAgo = currentKm - lastLog.kmAtTime;
  const lastDate =
    lastLog.createdAt instanceof Date
      ? lastLog.createdAt
      : new Date(lastLog.createdAt);
  const daysAgo = Math.floor(
    (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let maxProgress = 0;

  if (config.intervalKm != null) {
    maxProgress = Math.max(maxProgress, (kmAgo / config.intervalKm) * 100);
  }
  if (config.intervalDays != null) {
    maxProgress = Math.max(maxProgress, (daysAgo / config.intervalDays) * 100);
  }

  const progressPercent = Math.min(Math.round(maxProgress), 100);
  const warningAt = config.warningThreshold * 100;

  let status: MaintenanceStatus;
  if (maxProgress >= 100) status = "overdue";
  else if (maxProgress >= warningAt) status = "warning";
  else status = "ok";

  return { status, kmAgo, daysAgo, progressPercent };
}
