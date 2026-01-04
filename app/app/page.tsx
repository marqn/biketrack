import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import LubeButton from "./lube-button";

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      bikes: {
        include: {
          parts: true,
          services: {
            where: { type: "CHAIN_LUBE" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });
  

  if (!user?.bikes?.[0]) redirect("/onboarding");

  const chain = user.bikes[0].parts.find((p) => p.type === "CHAIN");
  if (!chain) return null;

  const lastLube = user.bikes[0].services[0];
  const kmSinceLube = lastLube
    ? user.bikes[0].totalKm - lastLube.kmAtTime
    : user.bikes[0].totalKm;

  return (
    <main style={styles.container}>
      <h1>🚴 {user.bikes[0].type}</h1>

      <section style={styles.card}>
        <h2>🔗 Łańcuch</h2>
        <p>{kmSinceLube} km od ostatniego smarowania</p>

        <LubeButton />
      </section>
    </main>
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
