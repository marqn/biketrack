-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PartType" ADD VALUE 'MOTOR';
ALTER TYPE "PartType" ADD VALUE 'BATTERY';
ALTER TYPE "PartType" ADD VALUE 'CONTROLLER';

-- AlterTable
ALTER TABLE "Bike" ADD COLUMN     "isElectric" BOOLEAN NOT NULL DEFAULT false;
