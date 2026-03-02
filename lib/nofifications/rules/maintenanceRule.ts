import { NotificationType } from "@/lib/generated/prisma";
import { MAINTENANCE_ITEMS, computeMaintenanceStatus } from "@/lib/maintenance-config";
import type { BikeWithSyncData, NotifInput } from '../checkBikeNotifications';

export function maintenanceRule(bike: BikeWithSyncData, existingNotifs: Set<string>): NotifInput[] {
  const hidden = new Set(bike.hiddenMaintenanceItems as string[]);
  const overdueItems: string[] = [];

  for (const config of MAINTENANCE_ITEMS) {
    if (hidden.has(config.type)) continue;
    const lastLog = bike.maintenanceLogs.find(l => l.type === config.type) ?? null;
    const { status } = computeMaintenanceStatus(config, lastLog, bike.totalKm);
    if (status === "overdue" || status === "never") {
      overdueItems.push(config.label);
    }
  }

  if (overdueItems.length === 0) return [];

  const key = `${NotificationType.SERVICE_DUE}-${bike.id}-null`;
  if (existingNotifs.has(key)) return [];

  const bikeName = bike.brand || bike.model
    ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
    : bike.type;

  existingNotifs.add(key);
  return [{
    userId: bike.userId,
    type: NotificationType.SERVICE_DUE,
    title: `Zaległa konserwacja – ${bikeName}`,
    message: `Wymagane czynności: ${overdueItems.join(", ")}.`,
    bikeId: bike.id,
  }];
}
