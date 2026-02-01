-- CreateTable
CREATE TABLE "BikeProduct" (
    "id" TEXT NOT NULL,
    "bikeType" "BikeType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "specifications" JSONB,
    "description" TEXT,
    "officialImageUrl" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BikeProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BikeProduct_brand_idx" ON "BikeProduct"("brand");

-- CreateIndex
CREATE INDEX "BikeProduct_bikeType_idx" ON "BikeProduct"("bikeType");

-- CreateIndex
CREATE UNIQUE INDEX "BikeProduct_bikeType_brand_model_key" ON "BikeProduct"("bikeType", "brand", "model");
