import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPartProducts, deletePartProduct } from "../_actions/part-products";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PartsTable } from "./PartsTable";

export default async function PartsPage() {
  const { products } = await getPartProducts({ all: true });
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("partsTitle")}</h1>
        <Link href="/admin/parts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addPart")}
          </Button>
        </Link>
      </div>

      <PartsTable products={products} onDelete={deletePartProduct} />
    </div>
  );
}
