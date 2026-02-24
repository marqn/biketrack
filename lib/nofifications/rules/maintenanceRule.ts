import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/lib/generated/prisma";
import { ensureNotification } from "../utils/ensureNotification";
import {
  MAINTENANCE_ITEMS,
  computeMaintenanceStatus,
} from "@/lib/maintenance-config";

export async function maintenanceRule(bikeId: string) {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: {
      userId: true,
      totalKm: true,
      brand: true,
      model: true,
      type: true,
      hiddenMaintenanceItems: true,
      maintenanceLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!bike) return;

  const hidden = new Set(bike.hiddenMaintenanceItems as string[]);

  const overdueItems: string[] = [];

  for (const config of MAINTENANCE_ITEMS) {
    if (hidden.has(config.type)) continue;

    const lastLog =
      bike.maintenanceLogs.find((l) => l.type === config.type) ?? null;
    const { status } = computeMaintenanceStatus(config, lastLog, bike.totalKm);

    if (status === "overdue" || status === "never") {
      overdueItems.push(config.label);
    }
  }

  if (overdueItems.length === 0) return;

  const bikeName =
    bike.brand || bike.model
      ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
      : bike.type;

  const itemsList = overdueItems.join(", ");

  await ensureNotification({
    userId: bike.userId,
    type: NotificationType.SERVICE_DUE,
    title: `Zaległa konserwacja – ${bikeName}`,
    message: `Wymagane czynności: ${itemsList}.`,
    bikeId,
  });
}
