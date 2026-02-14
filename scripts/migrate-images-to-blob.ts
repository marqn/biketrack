/**
 * Skrypt migracji obrazów z base64 (PostgreSQL) na Vercel Blob Storage.
 *
 * Uruchomienie:
 *   npx tsx scripts/migrate-images-to-blob.ts
 *
 * Wymaga zmiennej środowiskowej BLOB_READ_WRITE_TOKEN.
 */

import { put } from "@vercel/blob";
import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

async function migrateBikeImages() {
  const bikes = await prisma.bike.findMany({
    where: {
      imageUrl: { not: null },
    },
    select: { id: true, imageUrl: true, images: true },
  });

  // Filtruj tylko base64
  const bikesWithBase64 = bikes.filter(
    (b) => b.imageUrl?.startsWith("data:image/") && b.images.length === 0
  );

  console.log(
    `Znaleziono ${bikesWithBase64.length} rowerów z base64 do migracji`
  );

  let success = 0;
  let failed = 0;

  for (const bike of bikesWithBase64) {
    try {
      const matches = bike.imageUrl!.match(
        /^data:(image\/[\w+]+);base64,(.+)$/
      );
      if (!matches) {
        console.warn(`  Pominięto rower ${bike.id} - nieprawidłowy format`);
        failed++;
        continue;
      }

      const mimeType = matches[1];
      const ext = getExtensionFromMime(mimeType);
      const buffer = Buffer.from(matches[2], "base64");

      const blob = await put(`bikes/${bike.id}/main.${ext}`, buffer, {
        access: "public",
        addRandomSuffix: true,
        contentType: mimeType,
      });

      await prisma.bike.update({
        where: { id: bike.id },
        data: {
          images: [blob.url],
          imageUrl: null,
        },
      });

      success++;
      console.log(`  OK rower ${bike.id}: ${blob.url}`);
    } catch (error) {
      failed++;
      console.error(`  BŁĄD rower ${bike.id}:`, error);
    }
  }

  console.log(
    `Rowery: ${success} OK, ${failed} błędów z ${bikesWithBase64.length} łącznie`
  );
}

async function migrateUserAvatars() {
  const users = await prisma.user.findMany({
    where: {
      image: { not: null },
    },
    select: { id: true, image: true },
  });

  // Filtruj tylko base64 (nie zewnętrzne URL z OAuth)
  const usersWithBase64 = users.filter((u) =>
    u.image?.startsWith("data:image/")
  );

  console.log(
    `Znaleziono ${usersWithBase64.length} użytkowników z base64 avatarami`
  );

  let success = 0;
  let failed = 0;

  for (const user of usersWithBase64) {
    try {
      const matches = user.image!.match(
        /^data:(image\/[\w+]+);base64,(.+)$/
      );
      if (!matches) {
        console.warn(`  Pominięto user ${user.id} - nieprawidłowy format`);
        failed++;
        continue;
      }

      const mimeType = matches[1];
      const ext = getExtensionFromMime(mimeType);
      const buffer = Buffer.from(matches[2], "base64");

      const blob = await put(`avatars/${user.id}/avatar.${ext}`, buffer, {
        access: "public",
        addRandomSuffix: true,
        contentType: mimeType,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { image: blob.url },
      });

      success++;
      console.log(`  OK user ${user.id}: ${blob.url}`);
    } catch (error) {
      failed++;
      console.error(`  BŁĄD user ${user.id}:`, error);
    }
  }

  console.log(
    `Avatary: ${success} OK, ${failed} błędów z ${usersWithBase64.length} łącznie`
  );
}

async function main() {
  console.log("=== Migracja obrazów na Vercel Blob ===\n");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Brak BLOB_READ_WRITE_TOKEN w zmiennych środowiskowych!");
    process.exit(1);
  }

  console.log("--- Migracja zdjęć rowerów ---");
  await migrateBikeImages();

  console.log("\n--- Migracja avatarów ---");
  await migrateUserAvatars();

  console.log("\n=== Migracja zakończona ===");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Krytyczny błąd:", error);
  prisma.$disconnect();
  process.exit(1);
});
