"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Star, Users, Route, Plus, ArrowLeft } from "lucide-react";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels } from "@/lib/types";
import { getPartName } from "@/lib/default-parts";
import { PartType } from "@/lib/generated/prisma";
import {
  ReviewSortBy,
  ReviewWithUser,
  ProductDetails,
} from "@/app/app/actions/get-product-reviews";
import { ReviewCard } from "./ReviewCard";
import { AddReviewDialog } from "./AddReviewDialog";

interface ProductReviewsClientProps {
  product: ProductDetails;
  reviews: ReviewWithUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortBy: ReviewSortBy;
  bikeTypeFilter?: BikeType;
  userReview: {
    id: string;
    rating: number;
    reviewText: string | null;
    pros: string[];
    cons: string[];
    bikeType: BikeType;
  } | null;
  userId: string;
}

export function ProductReviewsClient({
  product,
  reviews,
  totalCount,
  totalPages,
  currentPage,
  sortBy,
  bikeTypeFilter,
  userReview,
  userId,
}: ProductReviewsClientProps) {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();

    if (sortBy && !updates.sort) params.set("sort", sortBy);
    if (bikeTypeFilter && !updates.bikeType)
      params.set("bikeType", bikeTypeFilter);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    startTransition(() => {
      router.push(`/app/products/${product.id}/reviews?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/app/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Powrot do listy produktow
      </Link>

      {/* Product Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {product.brand} {product.model}
              </CardTitle>
              <p className="text-muted-foreground">
                {getPartName(product.type as PartType)}
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {userReview ? "Edytuj opinie" : "Dodaj opinie"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Srednia ocena"
              value={product.averageRating?.toFixed(1) || "–"}
              icon={
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              }
            />
            <StatBox label="Liczba opinii" value={product.totalReviews.toString()} />
            <StatBox
              label="Instalacje"
              value={product.totalInstallations.toString()}
              icon={<Users className="w-5 h-5 text-muted-foreground" />}
            />
            <StatBox
              label="Sr. zywotnosc"
              value={
                product.averageKmLifespan
                  ? `${product.averageKmLifespan.toLocaleString("pl-PL")} km`
                  : "–"
              }
              icon={<Route className="w-5 h-5 text-muted-foreground" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter/Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select
          value={sortBy}
          onValueChange={(v) =>
            updateParams({ sort: v as ReviewSortBy, page: "1" })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sortuj" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsze</SelectItem>
            <SelectItem value="highest_rated">Najwyzej oceniane</SelectItem>
            <SelectItem value="lowest_rated">Najnizej oceniane</SelectItem>
            <SelectItem value="most_km">Najwiecej km</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={bikeTypeFilter || "all"}
          onValueChange={(v) =>
            updateParams({ bikeType: v === "all" ? undefined : v, page: "1" })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Typ roweru" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            {Object.entries(bikeTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "opinia" : "opinii"}
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              Brak opinii dla tego produktu. Badz pierwszy!
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isCurrentUser={review.user.id === userId}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    updateParams({ page: String(currentPage - 1) });
                  }}
                />
              </PaginationItem>
            )}

            {generatePageNumbers(currentPage, totalPages).map((page, i) =>
              page === "ellipsis" ? (
                <PaginationEllipsis key={`ellipsis-${i}`} />
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      updateParams({ page: String(page) });
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    updateParams({ page: String(currentPage + 1) });
                  }}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      {/* Add Review Dialog */}
      <AddReviewDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        productId={product.id}
        existingReview={userReview}
      />
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
        {icon}
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}
