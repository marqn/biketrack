/**
 * Skrypt do synchronizacji części wszystkich rowerów z aktualną konfiguracją DEFAULT_PARTS.
 * Uruchom: npx tsx scripts/sync-all-bikes.ts
 */

import { PrismaClient, BikeType } from "../lib/generated/prisma";
import { DEFAULT_PARTS } from "../lib/default-parts";

const prisma = new PrismaClient();

async function main() {
  console.log("Synchronizing bike parts with DEFAULT_PARTS...\n");

  const bikes = await prisma.bike.findMany({
    include: { parts: true, user: { select: { email: true } } },
  });

  console.log(`Found ${bikes.length} bikes to process.\n`);

  let totalAdded = 0;
  let totalBikesUpdated = 0;

  for (const bike of bikes) {
    const defaultParts = DEFAULT_PARTS[bike.type as BikeType];
    if (!defaultParts) {
      console.log(`⚠️  Bike ${bike.id} has unknown type: ${bike.type}`);
      continue;
    }

    const existingPartTypes = new Set(bike.parts.map((p) => p.type));
    const missingParts = defaultParts.filter((p) => !existingPartTypes.has(p.type));

    if (missingParts.length === 0) {
      console.log(`✓ Bike ${bike.id} (${bike.brand} ${bike.model}) - all parts present`);
      continue;
    }

    console.log(`\n→ Bike ${bike.id} (${bike.brand || "?"} ${bike.model || "?"}) - ${bike.type}`);
    console.log(`  User: ${bike.user.email}`);
    console.log(`  Missing ${missingParts.length} parts:`);

    for (const part of missingParts) {
      console.log(`    - ${part.type} (expectedKm: ${part.expectedKm})`);
    }

    // Add missing parts
    await prisma.bikePart.createMany({
      data: missingParts.map((p) => ({
        bikeId: bike.id,
        type: p.type,
        expectedKm: p.expectedKm,
        wearKm: 0,
      })),
    });

    console.log(`  ✓ Added ${missingParts.length} parts`);
    totalAdded += missingParts.length;
    totalBikesUpdated++;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Summary:`);
  console.log(`  Bikes processed: ${bikes.length}`);
  console.log(`  Bikes updated: ${totalBikesUpdated}`);
  console.log(`  Parts added: ${totalAdded}`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
