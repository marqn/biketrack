import { prisma } from "@/lib/prisma";
import { NotificationStatus, NotificationType, PartType, ServiceType } from "@/lib/generated/prisma";
import { partWearRule } from "./rules/partWearRule";
import { chainLubeRule } from "./rules/chainLubeRule";
import { tubelessSealantRule } from "./rules/tubelessSealantRule";
import { brakeFluidRule } from "./rules/brakeFluidRule";
import { maintenanceRule } from "./rules/maintenanceRule";

export type BikeWithSyncData = {
  id: string;
  userId: string;
  totalKm: number;
  brand: string | null;
  model: string | null;
  type: string;
  hiddenMaintenanceItems: unknown;
  parts: Array<{
    id: string;
    type: PartType;
    wearKm: number;
    expectedKm: number | null;
    isInstalled: boolean;
    installedAt: Date | null;
    createdAt: Date;
    bikeId: string;
  }>;
  services: Array<{
    type: ServiceType;
    createdAt: Date;
    kmAtTime: number;
  }>;
  maintenanceLogs: Array<{
    type: string;
    createdAt: Date;
    kmAtTime: number;
  }>;
};

export type NotifInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  bikeId?: string;
  partId?: string;
};

export function notifKey(
  type: string,
  bikeId?: string | null,
  partId?: string | null
): string {
  return `${type}-${bikeId ?? "null"}-${partId ?? "null"}`;
}

export function collectBikeNotifications(
  bike: BikeWithSyncData,
  existingNotifs: Set<string>
): NotifInput[] {
  return [
    ...partWearRule(bike, existingNotifs),
    ...chainLubeRule(bike, existingNotifs),
    ...tubelessSealantRule(bike, existingNotifs),
    ...brakeFluidRule(bike, existingNotifs),
    ...maintenanceRule(bike, existingNotifs),
  ];
}

// Używane w update-bike-km.ts i innych miejscach (pobiera dane z DB, 3 zapytania zamiast ~15)
export async function checkBikeNotifications(bikeId: string) {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: {
      id: true,
      userId: true,
      totalKm: true,
      brand: true,
      model: true,
      type: true,
      hiddenMaintenanceItems: true,
      parts: {
        select: {
          id: true,
          type: true,
          wearKm: true,
          expectedKm: true,
          isInstalled: true,
          installedAt: true,
          createdAt: true,
          bikeId: true,
        },
      },
      services: {
        where: {
          type: {
            in: [
              ServiceType.CHAIN_LUBE,
              ServiceType.SEALANT_FRONT,
              ServiceType.SEALANT_REAR,
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        select: { type: true, createdAt: true, kmAtTime: true },
      },
      maintenanceLogs: {
        orderBy: { createdAt: "desc" },
        select: { type: true, createdAt: true, kmAtTime: true },
      },
    },
  });

  if (!bike) return;

  const existingRaw = await prisma.notification.findMany({
    where: { userId: bike.userId, bikeId, status: NotificationStatus.UNREAD },
    select: { type: true, bikeId: true, partId: true },
  });

  const existingSet = new Set(
    existingRaw.map((n) => notifKey(n.type, n.bikeId, n.partId))
  );

  const newNotifs = collectBikeNotifications(bike as unknown as BikeWithSyncData, existingSet);

  if (newNotifs.length > 0) {
    await prisma.notification.createMany({ data: newNotifs, skipDuplicates: true });
  }
}
