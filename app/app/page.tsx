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
  const padsFront = user.bikes[0].parts.find((p) => p.type === PartType.PADS_FRONT);
  if (!chain) return null;
  if (!padsFront) return null;

  const bike = user.bikes[0];
  const lastLube = bike.services[0];

  return (
    <>
      <main style={styles.container}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LogoutButton />
          <DeleteAccountButton />
        </div>

        <section style={styles.card}>
          <h2>🚲 Rower</h2>

          <KmForm bikeId={user.bikes[0].id} initialKm={user.bikes[0].totalKm} />
        </section>

      
        <PartCard
          partName="🔗 Łańcuch"
          wearKm={bike.totalKm} // tutaj był błąd
          expectedKm={chain.expectedKm}
          bikeId={bike.id}
          partType={PartType.CHAIN}
        >
          <LubeButton
            bikeId={user.bikes[0].id}
            currentKm={user.bikes[0].totalKm}
            lastLubeKmInitial={lastLube?.kmAtTime} // <-- przekazujemy ostatnie smarowanie z bazy
          />
        </PartCard>

        <PartCard
          partName="Klocki Hamulcowe przód"
          wearKm={bike.totalKm}
          expectedKm={9000} 
          partType={PartType.PADS_FRONT}
        >
          {/* <FillTubelessButton bikeId={user.bikes[0].id} /> */}
        </PartCard>
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
