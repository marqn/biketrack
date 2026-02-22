import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProducts, ProductSortBy } from "@/app/app/actions/get-products";
import { PartType } from "@/lib/generated/prisma";
import { PART_CATEGORIES, PartCategory } from "@/lib/default-parts";
import { ProductsClient } from "./ProductsClient";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: ProductSortBy;
    type?: PartType;
    category?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const sortBy = params.sort || "installations";
  const typeFilter = params.type;
  const categoryParam = params.category;
  const search = params.search;

  const category = categoryParam && categoryParam in PART_CATEGORIES
    ? categoryParam as PartCategory
    : undefined;
  const categoryTypes = category ? PART_CATEGORIES[category].types : undefined;

  const result = await getProducts({
    page,
    sortBy,
    type: typeFilter,
    types: !typeFilter ? categoryTypes : undefined,
    search,
  });

  return (
    <div className="container mx-auto px-4 py-8 pt-4">
      <ProductsClient
        products={result.products}
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        currentPage={result.currentPage}
        sortBy={sortBy}
        typeFilter={typeFilter}
        category={category}
        search={search}
      />
    </div>
  );
}
