import Link from "next/link";
import { getBikeProducts, deleteBikeProduct } from "../_actions/bike-products";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BikesTable } from "./BikesTable";

export default async function BikesPage() {
  const { products } = await getBikeProducts({ all: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rowery (BikeProduct)</h1>
        <Link href="/admin/bikes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj rower
          </Button>
        </Link>
      </div>

      <BikesTable products={products} onDelete={deleteBikeProduct} />
    </div>
  );
}
