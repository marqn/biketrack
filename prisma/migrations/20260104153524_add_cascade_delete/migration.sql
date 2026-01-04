-- DropForeignKey
ALTER TABLE "Bike" DROP CONSTRAINT "Bike_userId_fkey";

-- DropForeignKey
ALTER TABLE "BikePart" DROP CONSTRAINT "BikePart_bikeId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceEvent" DROP CONSTRAINT "ServiceEvent_bikeId_fkey";

-- AddForeignKey
ALTER TABLE "Bike" ADD CONSTRAINT "Bike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BikePart" ADD CONSTRAINT "BikePart_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;
