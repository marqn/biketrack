-- Fix: add missing SEALANT_FRONT and SEALANT_REAR values to ServiceType enum
-- (were added via prisma db push but never recorded as a migration)
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'SEALANT_FRONT';
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'SEALANT_REAR';
