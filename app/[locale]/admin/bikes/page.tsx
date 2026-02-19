import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getBikeProducts, deleteBikeProduct } from "../_actions/bike-products";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { DeleteButton } from "../_components/DeleteButton";

export default async function BikesPage() {
  const { products } = await getBikeProducts({});
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("bikesTitle")}</h1>
        <Link href="/admin/bikes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addBike")}
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("brand")}</TableHead>
            <TableHead>{t("model")}</TableHead>
            <TableHead>{t("type")}</TableHead>
            <TableHead>{t("year")}</TableHead>
            <TableHead>{t("parts")}</TableHead>
            <TableHead className="w-[100px]">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.brand}</TableCell>
              <TableCell>{product.model}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.bikeType}</Badge>
              </TableCell>
              <TableCell>{product.year || "-"}</TableCell>
              <TableCell>
                {product.defaultParts.length > 0 ? (
                  <Badge variant="secondary">
                    {product.defaultParts.length} {t("partsCount")}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">{t("none")}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link href={`/admin/bikes/${product.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteButton
                    id={product.id}
                    onDelete={deleteBikeProduct}
                    confirmMessage={t("confirmDeleteBike")}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                {t("noBikes")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
