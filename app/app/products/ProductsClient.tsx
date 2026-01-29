"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Star, Users, Route } from "lucide-react";
import { PartType } from "@/lib/generated/prisma";
import { getPartName, PART_NAMES } from "@/lib/default-parts";
import { ProductSortBy, ProductListItem } from "@/app/app/actions/get-products";
import { useState, useTransition } from "react";

interface ProductsClientProps {
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortBy: ProductSortBy;
  typeFilter?: PartType;
  search?: string;
}

export function ProductsClient({
  products,
  totalCount,
  totalPages,
  currentPage,
  sortBy,
  typeFilter,
  search,
}: ProductsClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search || "");
  const [isPending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();

    if (sortBy && !updates.sort) params.set("sort", sortBy);
    if (typeFilter && !updates.type) params.set("type", typeFilter);
    if (search && !updates.search) params.set("search", search);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    startTransition(() => {
      router.push(`/app/products?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput || undefined, page: "1" });
  }

  const partTypes = Object.keys(PART_NAMES).filter(
    (t) => t !== "LUBRICANT",
  ) as PartType[];

  return (
    <div className="space-y-6 lg:px-24 text-center">
      <div>
        <h1 className="text-3xl font-bold">Produkty</h1>
        <p className="text-muted-foreground">
          Przegladaj i oceniaj czesci rowerowe
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj produktu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Szukaj
          </Button>
        </form>

        <Select
          value={typeFilter || "all"}
          onValueChange={(v) =>
            updateParams({ type: v === "all" ? undefined : v, page: "1" })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Typ czesci" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            {partTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {getPartName(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(v) =>
            updateParams({ sort: v as ProductSortBy, page: "1" })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sortuj" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="installations">Najpopularniejsze</SelectItem>
            <SelectItem value="rating">Najlepiej oceniane</SelectItem>
            <SelectItem value="reviews">Najwiecej opinii</SelectItem>
            <SelectItem value="newest">Najnowsze</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {totalCount} {totalCount === 1 ? "produkt" : "produktow"}
        </span>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              Nie znaleziono produktow
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
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
              ),
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
    </div>
  );
}

function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/app/products/${product.id}/reviews`}>
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {product.brand} {product.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getPartName(product.type as PartType)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">
                {product.averageRating?.toFixed(1) || "–"}
              </span>
              <span className="text-muted-foreground">
                ({product.totalReviews} opinii)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{product.totalInstallations} instalacji</span>
            </div>

            {product.averageKmLifespan && product.averageKmLifespan > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Route className="h-4 w-4" />
                <span>
                  ~{product.averageKmLifespan.toLocaleString("pl-PL")} km
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
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
