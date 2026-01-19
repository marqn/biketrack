-- AlterTable
ALTER TABLE "ServiceEvent" ADD COLUMN     "lubricantBrand" TEXT,
ADD COLUMN     "lubricantName" TEXT,
ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE INDEX "ServiceEvent_bikeId_type_idx" ON "ServiceEvent"("bikeId", "type");
