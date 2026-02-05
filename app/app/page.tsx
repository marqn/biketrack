import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LubeButton from "./lube-button";
import KmForm from "./km-form";
import { ServiceType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS, EBIKE_PARTS } from "@/lib/default-parts";
import { NotificationsList } from "@/components/notifications-list/NotificationsList";
import { ensureEmailMissingNotification } from "@/lib/nofifications/emailMissing";
import PartsAccordion from "@/components/parts-accordion/PartsAccordion";
import { cookies } from "next/headers";

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await ensureEmailMissingNotification(session.user.id);

  // Odczytaj wybrany rower z cookie
  const cookieStore = await cookies();
  const selectedBikeId = cookieStore.get("selectedBikeId")?.value;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bikes: {
        include: {
          parts: {
            include: {
              product: true,
              replacements: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
          services: {
            where: { type: ServiceType.CHAIN_LUBE },
            orderBy: { createdAt: "desc" },
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
        },
      },
    },
  });

  if (!user?.bikes?.[0]) redirect("/onboarding");

  // Znajdź wybrany rower lub użyj pierwszego
  const bike =
    (selectedBikeId && user.bikes.find((b) => b.id === selectedBikeId)) ||
    user.bikes[0];

  const lastLube = bike.services[0];

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
  }));

  return (
    <div className="space-y-6 lg:px-24 lg:space-6">
      <NotificationsList />

      <KmForm bikeId={bike.id} initialKm={bike.totalKm} />

      <PartsAccordion
        bikeId={bike.id}
        defaultParts={defaultParts}
        existingParts={existingParts}
        chainChildren={
          <LubeButton
            bikeId={bike.id}
            currentKm={bike.totalKm}
            lastLubeKmInitial={lastLube?.kmAtTime}
            lubeEvents={bike.services}
          />
        }
      />
    </div>
  );
}
