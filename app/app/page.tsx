import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LubeButton from "./lube-button";
import KmForm from "./km-form";
import PartCard from "../../components/part-card/PartCard";
import { PartType, ServiceType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS, PART_UI } from "@/lib/default-parts";
import { NotificationsList } from "@/components/notifications-list/NotificationsList";
import { ensureEmailMissingNotification } from "@/lib/nofifications/emailMissing";
import CalendarCard from "@/components/calendar-card/CalendarCard";

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await ensureEmailMissingNotification(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bikes: {
        include: {
          parts: {
            include: {
              // 👇 DODANE: Dołącz historię wymian
              replacements: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
          services: {
            where: { type: ServiceType.CHAIN_LUBE },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!user?.bikes?.[0]) redirect("/onboarding");

  const chain = user.bikes[0].parts.find((p) => p.type === PartType.CHAIN);
  const bike = user.bikes[0];
  const lastLube = bike.services[0];

  return (
    <div className="space-y-6 lg:px-24 lg:space-6">
      <NotificationsList />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <KmForm bikeId={bike.id} initialKm={bike.totalKm} />
        <CalendarCard />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <PartCard
          partId={chain?.id || ""} // 👈 DODANE
          partName={`⛓️ | Łańcuch`}
          wearKm={chain?.wearKm || 0}
          expectedKm={chain?.expectedKm || 0}
          bikeId={bike.id}
          partType={PartType.CHAIN}
          replacements={chain?.replacements || []} // 👈 DODANE
        >
          <LubeButton
            bikeId={bike.id}
            currentKm={bike.totalKm}
            lastLubeKmInitial={lastLube?.kmAtTime}
          />
        </PartCard>

        {DEFAULT_PARTS[bike.type]
          .filter((part) => part.type !== PartType.CHAIN)
          .map((part) => {
            const existingPart = bike.parts.find((p) => p.type === part.type);

            return (
              <PartCard
                key={part.type}
                partId={existingPart?.id || ""} // 👈 DODANE
                partName={PART_UI[part.type]}
                expectedKm={part.expectedKm}
                wearKm={existingPart?.wearKm || 0}
                bikeId={bike.id}
                partType={part.type}
                replacements={existingPart?.replacements || []} // 👈 DODANE
              />
            );
          })}
      </div>
    </div>
  );
}