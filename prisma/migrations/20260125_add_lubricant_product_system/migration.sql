-- AlterEnum: Add LUBRICANT to PartType
ALTER TYPE "PartType" ADD VALUE 'LUBRICANT';

-- AlterTable: Add lubricantProductId to ServiceEvent
ALTER TABLE "ServiceEvent" ADD COLUMN "lubricantProductId" TEXT;

-- AlterTable: Make partId optional and add serviceEventId to PartReview
ALTER TABLE "PartReview" ALTER COLUMN "partId" DROP NOT NULL;
ALTER TABLE "PartReview" ADD COLUMN "serviceEventId" TEXT;

-- CreateIndex
CREATE INDEX "ServiceEvent_lubricantProductId_idx" ON "ServiceEvent"("lubricantProductId");

-- CreateIndex (unique constraint for lubricant reviews)
CREATE UNIQUE INDEX "PartReview_userId_serviceEventId_key" ON "PartReview"("userId", "serviceEventId");

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_lubricantProductId_fkey" FOREIGN KEY ("lubricantProductId") REFERENCES "PartProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReview" ADD CONSTRAINT "PartReview_serviceEventId_fkey" FOREIGN KEY ("serviceEventId") REFERENCES "ServiceEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
