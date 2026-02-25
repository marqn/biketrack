-- Fix: add createdAt to User if it doesn't exist
-- (was present in init migration but missing in some production databases)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
