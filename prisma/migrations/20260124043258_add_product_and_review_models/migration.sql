-- AlterTable
ALTER TABLE "BikePart" ADD COLUMN     "installedAt" TIMESTAMP(3),
ADD COLUMN     "partSpecificData" JSONB,
ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "PartReplacement" ADD COLUMN     "productId" TEXT;

-- CreateTable
CREATE TABLE "PartProduct" (
    "id" TEXT NOT NULL,
    "type" "PartType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "description" TEXT,
    "officialImageUrl" TEXT,
    "officialPrice" DECIMAL(10,2),
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "averageKmLifespan" INTEGER DEFAULT 0,
    "totalInstallations" INTEGER NOT NULL DEFAULT 0,
    "specifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "kmAtReview" INTEGER NOT NULL,
    "kmUsed" INTEGER NOT NULL,
    "bikeType" "BikeType" NOT NULL,
    "pros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartProduct_type_averageRating_idx" ON "PartProduct"("type", "averageRating");

-- CreateIndex
CREATE INDEX "PartProduct_brand_idx" ON "PartProduct"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "PartProduct_type_brand_model_key" ON "PartProduct"("type", "brand", "model");

-- CreateIndex
CREATE INDEX "PartReview_productId_rating_idx" ON "PartReview"("productId", "rating");

-- CreateIndex
CREATE INDEX "PartReview_userId_idx" ON "PartReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartReview_userId_partId_key" ON "PartReview"("userId", "partId");

-- CreateIndex
CREATE INDEX "BikePart_productId_idx" ON "BikePart"("productId");

-- CreateIndex
CREATE INDEX "PartReplacement_productId_idx" ON "PartReplacement"("productId");

-- AddForeignKey
ALTER TABLE "BikePart" ADD CONSTRAINT "BikePart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PartProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReview" ADD CONSTRAINT "PartReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReview" ADD CONSTRAINT "PartReview_partId_fkey" FOREIGN KEY ("partId") REFERENCES "BikePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReview" ADD CONSTRAINT "PartReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PartProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
