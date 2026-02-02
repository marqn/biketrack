-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PartType" ADD VALUE 'FRAME';
ALTER TYPE "PartType" ADD VALUE 'FORK';
ALTER TYPE "PartType" ADD VALUE 'HEADSET';
ALTER TYPE "PartType" ADD VALUE 'BOTTOM_BRACKET';
ALTER TYPE "PartType" ADD VALUE 'CRANKSET';
ALTER TYPE "PartType" ADD VALUE 'DERAILLEUR_FRONT';
ALTER TYPE "PartType" ADD VALUE 'DERAILLEUR_REAR';
ALTER TYPE "PartType" ADD VALUE 'SHIFTERS';
ALTER TYPE "PartType" ADD VALUE 'BRAKES';
ALTER TYPE "PartType" ADD VALUE 'BRAKE_LEVERS';
ALTER TYPE "PartType" ADD VALUE 'DISC_FRONT';
ALTER TYPE "PartType" ADD VALUE 'DISC_REAR';
ALTER TYPE "PartType" ADD VALUE 'HUBS';
ALTER TYPE "PartType" ADD VALUE 'RIMS';
ALTER TYPE "PartType" ADD VALUE 'SPOKES';
ALTER TYPE "PartType" ADD VALUE 'STEM';
ALTER TYPE "PartType" ADD VALUE 'HANDLEBAR';
ALTER TYPE "PartType" ADD VALUE 'GRIPS';
ALTER TYPE "PartType" ADD VALUE 'SADDLE';
ALTER TYPE "PartType" ADD VALUE 'SEATPOST';
