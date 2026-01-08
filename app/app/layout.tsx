import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BikeHeader } from "./bike-header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  let headerProps = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        bikes: true,
      },
    });

    if (user?.bikes?.[0]) {
      const headerBike = {
        id: user.bikes[0].id,
        name: user.bikes[0].type,
        totalKm: user.bikes[0].totalKm,
        syncStatus: "synced",
      };

      const headerBikes = user.bikes.map((b) => ({
        id: b.id,
        name: b.type,
        totalKm: b.totalKm,
        syncStatus: "synced",
      }));

      headerProps = {
        bike: headerBike,
        bikes: headerBikes,
        user: {
          name: user.name!,
          email: user.email!,
          image: user.image,
        //   plan: user.plan,
        },
      };
    }
  }

  return (
    <>
      {headerProps && <BikeHeader {...headerProps} />}
      <main className="container mx-auto px-2 pt-24 pb-2">{children}</main>
    </>
  );
}
