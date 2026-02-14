import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const MAX_IMAGES_BIKE = 3;
const MAX_IMAGES_PART = 3;
const MAX_IMAGES_REVIEW = 3;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          throw new Error("Nie jesteś zalogowany");
        }

        const payload = JSON.parse(clientPayload || "{}");
        const { type, entityId } = payload as {
          type: "bike" | "part" | "avatar" | "review";
          entityId: string;
        };

        if (!type || !entityId) {
          throw new Error("Brak wymaganych parametrów");
        }

        // Walidacja ownership i limitu zdjęć
        if (type === "bike") {
          const bike = await prisma.bike.findUnique({
            where: { id: entityId },
            select: { userId: true, images: true },
          });
          if (!bike || bike.userId !== session.user.id) {
            throw new Error("Brak uprawnień");
          }
          if (bike.images.length >= MAX_IMAGES_BIKE) {
            throw new Error(`Maksymalnie ${MAX_IMAGES_BIKE} zdjęcia`);
          }
        } else if (type === "part") {
          const part = await prisma.bikePart.findUnique({
            where: { id: entityId },
            include: { bike: { select: { userId: true } } },
          });
          if (!part || part.bike.userId !== session.user.id) {
            throw new Error("Brak uprawnień");
          }
          if (part.images.length >= MAX_IMAGES_PART) {
            throw new Error(`Maksymalnie ${MAX_IMAGES_PART} zdjęcia`);
          }
        } else if (type === "avatar") {
          if (entityId !== session.user.id) {
            throw new Error("Brak uprawnień");
          }
        } else if (type === "review") {
          // Dla recenzji sprawdzamy tylko czy produkt istnieje
          // entityId = productId (recenzja może jeszcze nie istnieć)
          const product = await prisma.partProduct.findUnique({
            where: { id: entityId },
          });
          if (!product) {
            throw new Error("Produkt nie istnieje");
          }
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          maximumSizeInBytes: 2 * 1024 * 1024, // 2MB (po kompresji client-side)
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // DB update jest obsługiwany przez server action save-blob-image
        // po stronie klienta (po zakończeniu uploadu)
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
