-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('synced', 'syncing', 'error');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PartType" ADD VALUE 'CHAINRING_1X';
ALTER TYPE "PartType" ADD VALUE 'SUSPENSION_FORK';
ALTER TYPE "PartType" ADD VALUE 'DROPPER_POST';
ALTER TYPE "PartType" ADD VALUE 'TUBELESS_SEALANT';
ALTER TYPE "PartType" ADD VALUE 'HANDLEBAR_TAPE';
ALTER TYPE "PartType" ADD VALUE 'SUSPENSION_SEATPOST';

-- AlterTable
ALTER TABLE "Bike" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "name" TEXT;
