import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LubeButton from "./lube-button";
import SealantButton from "./sealant-button";
import KmForm from "./km-form";
import { ServiceType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS, EBIKE_PARTS, extractTubelessStatus } from "@/lib/default-parts";
import { NotificationsList } from "@/components/notifications-list/NotificationsList";
import { ensureEmailMissingNotification } from "@/lib/nofifications/emailMissing";
import PartsAccordion from "@/components/parts-accordion/PartsAccordion";
import { StravaSyncTrigger } from "@/components/strava-sync-trigger";
import { cookies } from "next/headers";

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await ensureEmailMissingNotification(session.user.id);

  // Odczytaj wybrany rower z cookie
  const cookieStore = await cookies();
  const selectedBikeId = cookieStore.get("selectedBikeId")?.value;

  const bikeInclude = {
    parts: {
      include: {
        product: true,
        replacements: {
          orderBy: { createdAt: "desc" } as const,
        },
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
      orderBy: { createdAt: "desc" } as const,
      include: {
        lubricantProduct: {
          select: {
            id: true,
            brand: true,
            model: true,
            specifications: true,
            averageRating: true,
            totalReviews: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            reviewText: true,
          },
          take: 1,
        },
      },
    },
  };

  // Pobierz wybrany rower z cookie
  let bike = selectedBikeId
    ? await prisma.bike.findFirst({
        where: {
          userId: session.user.id,
          id: selectedBikeId,
        },
        include: bikeInclude,
      })
    : null;

  // Fallback do pierwszego roweru jeśli wybrany nie istnieje lub brak cookie
  if (!bike) {
    bike = await prisma.bike.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: bikeInclude,
    });
  }

  if (!bike) redirect("/onboarding");

  // Sprawdź czy user ma konto Strava (do auto-sync dystansów)
  const stravaAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "strava" },
    select: { id: true },
  });

  // Rozdziel service events wg typu
  const lubeEvents = bike.services.filter(
    (s) => s.type === ServiceType.CHAIN_LUBE
  );
  const sealantFrontEvents = bike.services.filter(
    (s) => s.type === ServiceType.SEALANT_FRONT
  );
  const sealantRearEvents = bike.services.filter(
    (s) => s.type === ServiceType.SEALANT_REAR
  );
  const lastLube = lubeEvents[0];

  // Przygotuj dane dla PartsAccordion
  const defaultParts = [...DEFAULT_PARTS[bike.type], ...(bike.isElectric ? EBIKE_PARTS : [])];
  const existingParts = bike.parts.map((p) => ({
    id: p.id,
    type: p.type,
    wearKm: p.wearKm,
    expectedKm: p.expectedKm,
    isInstalled: p.isInstalled,
    product: p.product,
    replacements: p.replacements,
    createdAt: p.createdAt,
    installedAt: p.installedAt,
    partSpecificData: p.partSpecificData,
  }));

  return (
    <div className="space-y-6 lg:px-24 lg:space-6">
      {stravaAccount && <StravaSyncTrigger />}

      <KmForm bikeId={bike.id} initialKm={bike.totalKm} />

      <PartsAccordion
        bikeId={bike.id}
        bikeType={bike.type}
        defaultParts={defaultParts}
        existingParts={existingParts}
        chainChildren={
          <LubeButton
            bikeId={bike.id}
            currentKm={bike.totalKm}
            lastLubeKmInitial={lastLube?.kmAtTime}
            lubeEvents={lubeEvents}
          />
        }
        tireFrontChildren={
          extractTubelessStatus(existingParts).front ? (
            <SealantButton
              bikeId={bike.id}
              currentKm={bike.totalKm}
              wheel="front"
              sealantEvents={sealantFrontEvents}
            />
          ) : undefined
        }
        tireRearChildren={
          extractTubelessStatus(existingParts).rear ? (
            <SealantButton
              bikeId={bike.id}
              currentKm={bike.totalKm}
              wheel="rear"
              sealantEvents={sealantRearEvents}
            />
          ) : undefined
        }
      />
    </div>
  );
}
