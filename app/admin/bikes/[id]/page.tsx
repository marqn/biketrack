import { notFound } from "next/navigation";
import { getBikeProduct } from "../../_actions/bike-products";
import { BikeProductForm } from "../../_components/BikeProductForm";
import { DefaultPartsManager } from "../../_components/DefaultPartsManager";

export default async function EditBikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getBikeProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <BikeProductForm initialData={product} />
      <DefaultPartsManager
        bikeProductId={product.id}
        bikeType={product.bikeType}
        currentParts={product.defaultParts}
      />
    </div>
  );
}
