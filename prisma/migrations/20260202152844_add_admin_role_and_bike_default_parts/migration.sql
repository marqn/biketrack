-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "BikeProductDefaultPart" (
    "id" TEXT NOT NULL,
    "bikeProductId" TEXT NOT NULL,
    "partProductId" TEXT NOT NULL,
    "partType" "PartType" NOT NULL,
    "expectedKm" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BikeProductDefaultPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BikeProductDefaultPart_bikeProductId_idx" ON "BikeProductDefaultPart"("bikeProductId");

-- CreateIndex
CREATE INDEX "BikeProductDefaultPart_partProductId_idx" ON "BikeProductDefaultPart"("partProductId");

-- CreateIndex
CREATE UNIQUE INDEX "BikeProductDefaultPart_bikeProductId_partType_key" ON "BikeProductDefaultPart"("bikeProductId", "partType");

-- AddForeignKey
ALTER TABLE "BikeProductDefaultPart" ADD CONSTRAINT "BikeProductDefaultPart_bikeProductId_fkey" FOREIGN KEY ("bikeProductId") REFERENCES "BikeProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BikeProductDefaultPart" ADD CONSTRAINT "BikeProductDefaultPart_partProductId_fkey" FOREIGN KEY ("partProductId") REFERENCES "PartProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
