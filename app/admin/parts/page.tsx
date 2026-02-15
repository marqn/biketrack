import Link from "next/link";
import { getPartProducts, deletePartProduct } from "../_actions/part-products";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PartsTable } from "./PartsTable";

export default async function PartsPage() {
  const { products } = await getPartProducts({ all: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Części (PartProduct)</h1>
        <Link href="/admin/parts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj częśc
          </Button>
        </Link>
      </div>

      <PartsTable products={products} onDelete={deletePartProduct} />
    </div>
  );
}
