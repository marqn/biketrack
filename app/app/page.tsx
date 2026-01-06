import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LubeButton from "./lube-button";
import LogoutButton from "./logout-button";
import DeleteAccountButton from "./delete-account-button";
import { BikeMaintenanceApp } from "@/components/bike-maintenance-app";
import KmForm from "./km-form";
import PartCard from "./PartCard";
import { PartType, ServiceType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS } from "@/lib/default-parts";

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bikes: {
        include: {
          parts: true,
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
  const padsFront = user.bikes[0].parts.find(
    (p) => p.type === PartType.PADS_FRONT
  );
  const padsRear = user.bikes[0].parts.find(
    (p) => p.type === PartType.PADS_REAR
  );
  const cassette = user.bikes[0].parts.find(
    (p) => p.type === PartType.CASSETTE
  );
  const tire_front = user.bikes[0].parts.find(
    (p) => p.type === PartType.TIRE_FRONT
  );
  const tire_rear = user.bikes[0].parts.find(
    (p) => p.type === PartType.TIRE_REAR
  );
  if (!chain) return null;
  if (!padsFront) return null;
  if (!padsRear) return null;
  if (!cassette) return null;
  if (!tire_front) return null;
  if (!tire_rear) return null;

  const bike = user.bikes[0];
  const lastLube = bike.services[0];

  const PART_UI = {
    [PartType.CHAIN]: "⛓️ | Łańcuch",
    [PartType.CASSETTE]: "⚙️ | Kaseta",
    [PartType.PADS_FRONT]: "🧱⬅️ | Klocki przód",
    [PartType.PADS_REAR]: "🧱➡️ | Klocki tył",
    [PartType.TIRE_FRONT]: "🛞⬅️ | Opona przód",
    [PartType.TIRE_REAR]: "🛞➡️ | Opona tył",
    [PartType.HANDLEBAR_TAPE]: "🪢 | Taśma kierownicy",
    [PartType.SUSPENSION_FORK]: "🪵 | Wspornik zawieszenia",
    [PartType.DROPPER_POST]: "🪵 | Sztyca regulowana",
    [PartType.TUBELESS_SEALANT]: "🧼 | Mleko do opon bezdentkowych",
    [PartType.SUSPENSION_SEATPOST]: "🪵 | Siedzenie z zawieszeniem",
  };

  return (
    <>
      <main style={styles.container}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span>Typ roweru: {bike.type}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LogoutButton />
            <DeleteAccountButton />
          </div>
        </div>

        <KmForm bikeId={user.bikes[0].id} initialKm={user.bikes[0].totalKm} />

        <PartCard
          partName={`⛓️ | Łańcuch`}
          wearKm={chain.wearKm}
          expectedKm={chain.expectedKm}
          bikeId={bike.id}
          partType={PartType.CHAIN}
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
            // Znajdź odpowiednią część w bike.parts
            const existingPart = bike.parts.find((p) => p.type === part.type);

            return (
              <PartCard
                key={part.type}
                partName={PART_UI[part.type]}
                expectedKm={part.expectedKm}
                wearKm={existingPart?.wearKm || 0}
                bikeId={bike.id}
                partType={part.type}
              />
            );
          })}
      </main>

      {/* <BikeMaintenanceApp /> */}
    </>
  );
}

const styles = {
  container: {
    padding: 24,
    maxWidth: 480,
    margin: "0 auto",
  },
  card: {
    marginTop: 24,
    padding: 16,
    border: "1px solid #ddd",
    borderRadius: 8,
  },
};
