import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProducts, ProductSortBy } from "@/app/actions/get-products";
import { PartType } from "@/lib/generated/prisma";
import { ProductsClient } from "./ProductsClient";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: ProductSortBy;
    type?: PartType;
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
  const search = params.search;

  const result = await getProducts({
    page,
    sortBy,
    type: typeFilter,
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
        search={search}
      />
    </div>
  );
}
