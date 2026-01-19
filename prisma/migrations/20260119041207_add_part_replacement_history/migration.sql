-- CreateTable
CREATE TABLE "PartReplacement" (
    "id" TEXT NOT NULL,
    "bikeId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "partType" "PartType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "notes" TEXT,
    "kmAtReplacement" INTEGER NOT NULL,
    "kmUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartReplacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartReplacement_bikeId_partType_idx" ON "PartReplacement"("bikeId", "partType");

-- CreateIndex
CREATE INDEX "PartReplacement_partId_idx" ON "PartReplacement"("partId");

-- AddForeignKey
ALTER TABLE "PartReplacement" ADD CONSTRAINT "PartReplacement_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReplacement" ADD CONSTRAINT "PartReplacement_partId_fkey" FOREIGN KEY ("partId") REFERENCES "BikePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
