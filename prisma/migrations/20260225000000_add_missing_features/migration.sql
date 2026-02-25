-- =============================================================
-- Missing features migration
-- Adds all columns/tables that were applied via "prisma db push"
-- but never recorded as a proper migration.
-- =============================================================

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('TIRE_PRESSURE', 'BIDON_WASH', 'BIKE_WASH', 'DRIVETRAIN_CLEAN', 'CABLE_CHECK', 'SPOKE_CHECK', 'BOLT_CHECK', 'TIRE_CONDITION');

-- CreateEnum
CREATE TYPE "UnitPreference" AS ENUM ('METRIC', 'IMPERIAL');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('GENERAL', 'SUGGESTION', 'QUESTION');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'OFFENSIVE', 'IRRELEVANT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- AlterEnum PartType: add missing values
ALTER TYPE "PartType" ADD VALUE 'PEDALS';
ALTER TYPE "PartType" ADD VALUE 'CLEATS';
ALTER TYPE "PartType" ADD VALUE 'SHIFT_CABLES';
ALTER TYPE "PartType" ADD VALUE 'BRAKE_CALIPER_FRONT';
ALTER TYPE "PartType" ADD VALUE 'BRAKE_CALIPER_REAR';
ALTER TYPE "PartType" ADD VALUE 'BRAKE_CABLES';
ALTER TYPE "PartType" ADD VALUE 'BRAKE_FLUID';
ALTER TYPE "PartType" ADD VALUE 'INNER_TUBE_FRONT';
ALTER TYPE "PartType" ADD VALUE 'INNER_TUBE_REAR';
ALTER TYPE "PartType" ADD VALUE 'TUBELESS_SEALANT_FRONT';
ALTER TYPE "PartType" ADD VALUE 'TUBELESS_SEALANT_REAR';
ALTER TYPE "PartType" ADD VALUE 'FENDER_FRONT';
ALTER TYPE "PartType" ADD VALUE 'FENDER_REAR';
ALTER TYPE "PartType" ADD VALUE 'KICKSTAND';
ALTER TYPE "PartType" ADD VALUE 'RACK';
ALTER TYPE "PartType" ADD VALUE 'BAG_SADDLE';
ALTER TYPE "PartType" ADD VALUE 'BAG_FRAME';
ALTER TYPE "PartType" ADD VALUE 'BOTTLE_CAGE';
ALTER TYPE "PartType" ADD VALUE 'LIGHT_FRONT';
ALTER TYPE "PartType" ADD VALUE 'LIGHT_REAR';
ALTER TYPE "PartType" ADD VALUE 'BELL';
ALTER TYPE "PartType" ADD VALUE 'COMPUTER';

-- AlterEnum: add social notification types
ALTER TYPE "NotificationType" ADD VALUE 'NEW_COMMENT';
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_REPLY';

-- AlterTable: User – add missing columns
ALTER TABLE "User"
ADD COLUMN "plan"              "Plan"            NOT NULL DEFAULT 'FREE',
ADD COLUMN "planExpiresAt"     TIMESTAMP(3),
ADD COLUMN "bio"               TEXT,
ADD COLUMN "profileSlug"       TEXT,
ADD COLUMN "lastStravaSync"    TIMESTAMP(3),
ADD COLUMN "partsDisplayOrder" JSONB,
ADD COLUMN "unitPreference"    "UnitPreference"  NOT NULL DEFAULT 'METRIC';

CREATE UNIQUE INDEX "User_profileSlug_key" ON "User"("profileSlug");

-- AlterTable: Bike – add missing columns
ALTER TABLE "Bike"
ADD COLUMN "description"            TEXT,
ADD COLUMN "stravaGearId"           TEXT,
ADD COLUMN "isPublic"               BOOLEAN   NOT NULL DEFAULT false,
ADD COLUMN "slug"                   TEXT,
ADD COLUMN "images"                 TEXT[]    DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "imageUrl"               TEXT,
ADD COLUMN "hiddenMaintenanceItems" TEXT[]    DEFAULT ARRAY[]::TEXT[];

CREATE UNIQUE INDEX "Bike_stravaGearId_key" ON "Bike"("stravaGearId");
CREATE UNIQUE INDEX "Bike_slug_key"         ON "Bike"("slug");
CREATE INDEX "Bike_isPublic_type_idx"       ON "Bike"("isPublic", "type");

-- AlterTable: BikePart – add missing columns
ALTER TABLE "BikePart"
ADD COLUMN "isInstalled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "images"      TEXT[]  DEFAULT ARRAY[]::TEXT[];

-- AlterTable: PartProduct – add missing column
ALTER TABLE "PartProduct"
ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable: PartReview – add missing column
ALTER TABLE "PartReview"
ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable: BikeProduct – add missing columns
ALTER TABLE "BikeProduct"
ADD COLUMN "isElectric" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isPublic"   BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Notification – add commentId
ALTER TABLE "Notification"
ADD COLUMN "commentId" TEXT;

-- CreateTable: CustomPart
CREATE TABLE "CustomPart" (
    "id"          TEXT      NOT NULL,
    "bikeId"      TEXT      NOT NULL,
    "name"        TEXT      NOT NULL,
    "category"    TEXT      NOT NULL,
    "wearKm"      INTEGER   NOT NULL DEFAULT 0,
    "expectedKm"  INTEGER   NOT NULL DEFAULT 0,
    "brand"       TEXT,
    "model"       TEXT,
    "installedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomPart_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomPart_bikeId_idx" ON "CustomPart"("bikeId");

ALTER TABLE "CustomPart"
    ADD CONSTRAINT "CustomPart_bikeId_fkey"
    FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: MaintenanceLog
CREATE TABLE "MaintenanceLog" (
    "id"        TEXT            NOT NULL,
    "bikeId"    TEXT            NOT NULL,
    "type"      "MaintenanceType" NOT NULL,
    "kmAtTime"  INTEGER         NOT NULL,
    "notes"     TEXT,
    "createdAt" TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MaintenanceLog_bikeId_type_createdAt_idx" ON "MaintenanceLog"("bikeId", "type", "createdAt");

ALTER TABLE "MaintenanceLog"
    ADD CONSTRAINT "MaintenanceLog_bikeId_fkey"
    FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: StoredPart
CREATE TABLE "StoredPart" (
    "id"              TEXT         NOT NULL,
    "userId"          TEXT         NOT NULL,
    "partType"        "PartType"   NOT NULL,
    "brand"           TEXT,
    "model"           TEXT,
    "wearKm"          INTEGER      NOT NULL DEFAULT 0,
    "expectedKm"      INTEGER      NOT NULL DEFAULT 0,
    "productId"       TEXT,
    "partSpecificData" JSONB,
    "notes"           TEXT,
    "fromBikeId"      TEXT,
    "removedAt"       TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoredPart_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StoredPart_userId_idx"    ON "StoredPart"("userId");
CREATE INDEX "StoredPart_productId_idx" ON "StoredPart"("productId");

ALTER TABLE "StoredPart"
    ADD CONSTRAINT "StoredPart_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StoredPart"
    ADD CONSTRAINT "StoredPart_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "PartProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CustomStoredPart
CREATE TABLE "CustomStoredPart" (
    "id"               TEXT         NOT NULL,
    "userId"           TEXT         NOT NULL,
    "name"             TEXT         NOT NULL,
    "category"         TEXT         NOT NULL,
    "brand"            TEXT,
    "model"            TEXT,
    "wearKm"           INTEGER      NOT NULL DEFAULT 0,
    "expectedKm"       INTEGER      NOT NULL DEFAULT 0,
    "installedAt"      TIMESTAMP(3),
    "notes"            TEXT,
    "inGarage"         BOOLEAN      NOT NULL DEFAULT true,
    "fromBikeId"       TEXT,
    "fromCustomPartId" TEXT,
    "removedAt"        TIMESTAMP(3),
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomStoredPart_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomStoredPart_userId_idx"          ON "CustomStoredPart"("userId");
CREATE INDEX "CustomStoredPart_fromCustomPartId_idx" ON "CustomStoredPart"("fromCustomPartId");

ALTER TABLE "CustomStoredPart"
    ADD CONSTRAINT "CustomStoredPart_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: BikeLike
CREATE TABLE "BikeLike" (
    "id"        TEXT         NOT NULL,
    "bikeId"    TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BikeLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BikeLike_bikeId_userId_key" ON "BikeLike"("bikeId", "userId");
CREATE INDEX "BikeLike_bikeId_idx"              ON "BikeLike"("bikeId");
CREATE INDEX "BikeLike_userId_idx"              ON "BikeLike"("userId");

ALTER TABLE "BikeLike"
    ADD CONSTRAINT "BikeLike_bikeId_fkey"
    FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BikeLike"
    ADD CONSTRAINT "BikeLike_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: BikeComment
CREATE TABLE "BikeComment" (
    "id"        TEXT            NOT NULL,
    "bikeId"    TEXT            NOT NULL,
    "userId"    TEXT            NOT NULL,
    "parentId"  TEXT,
    "content"   TEXT            NOT NULL,
    "type"      "CommentType"   NOT NULL DEFAULT 'GENERAL',
    "isHidden"  BOOLEAN         NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)    NOT NULL,

    CONSTRAINT "BikeComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BikeComment_bikeId_createdAt_idx" ON "BikeComment"("bikeId", "createdAt");
CREATE INDEX "BikeComment_userId_idx"            ON "BikeComment"("userId");
CREATE INDEX "BikeComment_parentId_idx"          ON "BikeComment"("parentId");

ALTER TABLE "BikeComment"
    ADD CONSTRAINT "BikeComment_bikeId_fkey"
    FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BikeComment"
    ADD CONSTRAINT "BikeComment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BikeComment"
    ADD CONSTRAINT "BikeComment_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "BikeComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: CommentReport
CREATE TABLE "CommentReport" (
    "id"        TEXT           NOT NULL,
    "commentId" TEXT           NOT NULL,
    "userId"    TEXT           NOT NULL,
    "reason"    "ReportReason" NOT NULL,
    "details"   TEXT,
    "status"    "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommentReport_commentId_userId_key" ON "CommentReport"("commentId", "userId");
CREATE INDEX "CommentReport_status_idx"              ON "CommentReport"("status");

ALTER TABLE "CommentReport"
    ADD CONSTRAINT "CommentReport_commentId_fkey"
    FOREIGN KEY ("commentId") REFERENCES "BikeComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommentReport"
    ADD CONSTRAINT "CommentReport_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
