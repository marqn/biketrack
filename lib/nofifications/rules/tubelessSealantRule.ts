import { prisma } from "@/lib/prisma"
import { NotificationType, ServiceType } from '@/lib/generated/prisma';
import { ensureNotification } from "../utils/ensureNotification"
import { SEALANT_INTERVAL_DAYS } from "@/lib/default-parts";

export async function tubelessSealantRule(bikeId: string) {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeId },
    select: { userId: true },
  })

  if (!bike) return

  // Sprawdź oba koła
  const wheels: Array<{ type: ServiceType; label: string }> = [
    { type: ServiceType.SEALANT_FRONT, label: "przednie" },
    { type: ServiceType.SEALANT_REAR, label: "tylne" },
  ]

  for (const wheel of wheels) {
    // Znajdź ostatni event wymiany mleka dla tego koła
    const lastEvent = await prisma.serviceEvent.findFirst({
      where: { bikeId, type: wheel.type },
      orderBy: { createdAt: "desc" },
    })

    // Brak eventów = użytkownik nie dodał jeszcze mleka — nie wysyłaj notyfikacji
    if (!lastEvent) continue

    const daysSince =
      (Date.now() - lastEvent.createdAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince < SEALANT_INTERVAL_DAYS) continue

    await ensureNotification({
      userId: bike.userId,
      type: NotificationType.SERVICE_DUE,
      title: `Wymień mleko tubeless (${wheel.label})`,
      message: `Od ostatniej wymiany mleka minęło ${Math.floor(
        daysSince
      )} dni.`,
      bikeId,
    })
  }
}
