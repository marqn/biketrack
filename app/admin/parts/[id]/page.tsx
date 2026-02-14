import { notFound } from "next/navigation";
import { getPartProduct } from "../../_actions/part-products";
import { PartProductForm } from "../../_components/PartProductForm";

export default async function EditPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPartProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <PartProductForm
        initialData={{
          ...product,
          specifications: product.specifications as Record<string, unknown> | null,
        }}
      />
    </div>
  );
}
