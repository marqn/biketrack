/*
  Warnings:

  - A unique constraint covering the columns `[bikeId,type]` on the table `BikePart` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ServiceEvent_bikeId_type_idx";

-- CreateIndex
CREATE INDEX "Bike_userId_idx" ON "Bike"("userId");

-- CreateIndex
CREATE INDEX "BikePart_bikeId_idx" ON "BikePart"("bikeId");

-- CreateIndex
CREATE UNIQUE INDEX "BikePart_bikeId_type_key" ON "BikePart"("bikeId", "type");

-- CreateIndex
CREATE INDEX "ServiceEvent_bikeId_type_createdAt_idx" ON "ServiceEvent"("bikeId", "type", "createdAt");
