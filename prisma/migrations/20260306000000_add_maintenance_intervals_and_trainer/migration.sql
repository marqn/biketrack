-- AlterEnum
ALTER TYPE "BikeType" ADD VALUE 'TRAINER';

-- AlterTable
ALTER TABLE "Bike" ADD COLUMN "maintenanceIntervals" JSONB NOT NULL DEFAULT '{}';

-- AddForeignKey
ALTER TABLE "PartReplacement" ADD CONSTRAINT "PartReplacement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PartProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
