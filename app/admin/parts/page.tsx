import Link from "next/link";
import { getPartProducts, deletePartProduct } from "../_actions/part-products";
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
import { Plus } from "lucide-react";
import { PART_NAMES } from "@/lib/default-parts";
import { PartType } from "@/lib/generated/prisma";
import { DeleteButton } from "../_components/DeleteButton";

export default async function PartsPage() {
  const { products } = await getPartProducts({});

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Typ</TableHead>
            <TableHead>Marka</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="w-20">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="group">
              <TableCell>
                <Link href={`/admin/parts/${product.id}`} className="block">
                  <Badge variant="outline">
                    {PART_NAMES[product.type as PartType] || product.type}
                  </Badge>
                </Link>
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/admin/parts/${product.id}`} className="block">
                  {product.brand}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/parts/${product.id}`} className="block">
                  {product.model}
                </Link>
              </TableCell>
              <TableCell>
                <DeleteButton
                  id={product.id}
                  onDelete={deletePartProduct}
                  confirmMessage="Czy na pewno chcesz usunac ta czesc?"
                />
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Brak części w bazie
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
