import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Warehouse } from "lucide-react";
import GarageList, {
  StoredPartData,
  CustomStoredPartData,
  BikeOption,
} from "@/components/garage/GarageList";

export const metadata = { title: "Garaż — MBike" };

export default async function GaragePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [storedParts, customStoredParts, user] = await Promise.all([
    prisma.storedPart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            officialImageUrl: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customStoredPart.findMany({
      where: { userId, inGarage: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        unitPreference: true,
        bikes: { select: { id: true, brand: true, model: true, type: true } },
      },
    }),
  ]);

  if (!user) redirect("/login");

  // Zbierz ID rowerów żeby pobrać ich nazwy dla fromBikeId
  const bikeMap = new Map(
    user.bikes.map((b) => [
      b.id,
      [b.brand, b.model].filter(Boolean).join(" ") || b.type,
    ])
  );

  // Pobierz aktywny rower z cookie żeby ustawić go jako domyślny w selectcie
  const cookieStore = await cookies();
  const selectedBikeId = cookieStore.get("selectedBikeId")?.value;
  const bikes: BikeOption[] = user.bikes.map((b) => ({
    id: b.id,
    label: [b.brand, b.model].filter(Boolean).join(" ") || b.type,
  }));
  // Przesuń aktywny rower na pierwszą pozycję
  const sortedBikes = selectedBikeId
    ? [
        ...bikes.filter((b) => b.id === selectedBikeId),
        ...bikes.filter((b) => b.id !== selectedBikeId),
      ]
    : bikes;

  const parts: StoredPartData[] = storedParts.map((p) => ({
    id: p.id,
    partType: p.partType,
    brand: p.brand,
    model: p.model,
    wearKm: p.wearKm,
    expectedKm: p.expectedKm,
    notes: p.notes,
    removedAt: p.removedAt,
    fromBikeName: p.fromBikeId ? (bikeMap.get(p.fromBikeId) ?? null) : null,
    productImageUrl: p.product?.officialImageUrl ?? null,
    productId: p.product?.id ?? null,
    averageRating: p.product?.averageRating ?? null,
    totalReviews: p.product?.totalReviews ?? 0,
  }));

  const customParts: CustomStoredPartData[] = customStoredParts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    brand: p.brand,
    model: p.model,
    wearKm: p.wearKm,
    expectedKm: p.expectedKm,
    notes: p.notes,
    removedAt: p.removedAt,
    fromBikeName: p.fromBikeId ? (bikeMap.get(p.fromBikeId) ?? null) : null,
  }));

  const unitPref = user.unitPreference ?? "METRIC";
  const totalParts = parts.length + customParts.length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
          <Warehouse className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Garaż</h1>
        <p className="text-lg">
          {totalParts > 0
            ? `${totalParts} ${totalParts === 1 ? "część" : totalParts < 5 ? "części" : "części"} na przechowaniu`
            : "Przechowuj zdjęte części i instaluj je ponownie"}
        </p>
      </div>

      <GarageList parts={parts} customParts={customParts} bikes={sortedBikes} unitPref={unitPref} />
    </div>
  );
}
