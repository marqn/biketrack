import { notFound } from "next/navigation";
import { getPartProduct, getPartReviews } from "../../_actions/part-products";
import { PartProductForm } from "../../_components/PartProductForm";
import { PartReviewsList } from "./PartReviewsList";

export default async function EditPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, reviews] = await Promise.all([
    getPartProduct(id),
    getPartReviews(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PartProductForm
        initialData={{
          ...product,
          specifications: product.specifications as Record<string, unknown> | null,
          officialPrice: product.officialPrice?.toString() || null,
        }}
      />

      <PartReviewsList reviews={reviews} productId={id} />
    </div>
  );
}
