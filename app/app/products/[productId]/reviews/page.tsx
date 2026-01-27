import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getProductReviews,
  ReviewSortBy,
} from "@/app/app/actions/get-product-reviews";
import { getUserProductReview } from "@/app/app/actions/add-product-review";
import { BikeType } from "@/lib/generated/prisma";
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

  const [result, userReview] = await Promise.all([
    getProductReviews({
      productId,
      page,
      sortBy,
      bikeTypeFilter,
    }),
    getUserProductReview(productId),
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
        userId={session.user.id}
      />
    </div>
  );
}
