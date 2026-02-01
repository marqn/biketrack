import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { BikeHeader } from "../../components/bike-header/BikeHeader";
import { Footer } from "../../components/footer/Footer";

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
        type: user.bikes[0].type,
        brand: user.bikes[0].brand,
        model: user.bikes[0].model,
        totalKm: user.bikes[0].totalKm,
        userId: user.bikes[0].userId,
        createdAt: user.bikes[0].createdAt,
        syncStatus: "synced",
      };

      const headerBikes = user.bikes.map((b) => ({
        id: b.id,
        name: b.type, // Użyj typu jako nazwy,
        type: b.type,
        brand: b.brand,
        model: b.model,
        totalKm: b.totalKm,
        userId: b.userId,
        createdAt: b.createdAt,
      }));

      headerProps = {
        bike: headerBike,
        bikes: headerBikes,
        user: {
          id: user.id,
          name: user.name!,
          email: user.email!,
          image: user.image,
        //   plan: user.plan,
        },
      };
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {headerProps && <BikeHeader {...headerProps} />}
      <main className="flex-1 container mx-auto px-2 pt-24 pb-8">{children}</main>
      <Footer />
    </div>
  );
}
