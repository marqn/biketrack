export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth-options";
import {
  getProductReviews,
  ReviewSortBy,
} from "@/app/app/actions/get-product-reviews";
import { getUserProductReview } from "@/app/app/actions/add-product-review";
import { BikeType } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { ProductReviewsClient } from "./ProductReviewsClient";

interface PageProps {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: ReviewSortBy;
    bikeType?: BikeType;
  }>;
}

export default async function ProductReviewsPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { productId } = await params;
  const searchParamsResolved = await searchParams;

  const page = parseInt(searchParamsResolved.page || "1", 10);
  const sortBy = searchParamsResolved.sort || "newest";
  const bikeTypeFilter = searchParamsResolved.bikeType;

  const cookieStore = await cookies();
  const selectedBikeId = cookieStore.get("selectedBikeId")?.value;

  const [result, userReview, activeBike] = await Promise.all([
    getProductReviews({
      productId,
      page,
      sortBy,
      bikeTypeFilter,
      currentUserId: session.user.id,
    }),
    getUserProductReview(productId),
    selectedBikeId
      ? prisma.bike.findFirst({ where: { id: selectedBikeId, userId: session.user.id }, select: { type: true } })
      : prisma.bike.findFirst({ where: { userId: session.user.id }, select: { type: true } }),
  ]);

  if (!result.product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <ProductReviewsClient
        product={result.product}
        reviews={result.reviews}
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        currentPage={result.currentPage}
        sortBy={sortBy}
        bikeTypeFilter={bikeTypeFilter}
        userReview={userReview}
        defaultBikeType={activeBike?.type ?? BikeType.ROAD}
        userId={session.user.id}
        communityImages={result.communityImages}
      />
    </div>
  );
}
