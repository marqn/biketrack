import { BikeType } from "./generated/prisma"


export interface Bike {
  id: string
  name: string
  totalMileage: number
  syncStatus: "synced" | "syncing" | "error"
}

export interface ProductRating {
  id: string
  userId: string
  userName: string
  rating: number // 1-5
  pros: string[]
  cons: string[]
  mileageWhenRated: number
  componentType: string
  date: string
  verified: boolean // true if linked to actual usage
}

export interface ComponentProduct {
  id: string
  name?: string
  type: string // e.g., "cassette", "chainring", "derailleur", "brake-pads", "tire", "sealant"
  brand?: string
  model?: string
  averageRating?: number
  totalRatings?: number
  averageMileage?: number // average lifespan from users
  communityRecommended?: boolean
  sponsored?: boolean
  usageByTerrain?: {
    road: number
    gravel: number
    mtb: number
  }
}

export interface Lubricant {
  id: string
  name: string
  type: "oil" | "wax"
  interval: number
  conditions?: "dry" | "wet" | "all"
  averageRating?: number
  totalRatings?: number
  communityRecommended?: boolean
  sponsored?: boolean
  averageIntervalFromUsers?: number // real-world average
  usageByTerrain?: {
    road: number
    gravel: number
    mtb: number
  }
}

// Added ServiceRecord interface
export interface ServiceRecord {
  date: string
  action: string
  mileage: number
  notes?: string
  product?: ComponentProduct
}

export const bikeTypeLabels: Record<BikeType, string> = {
  ROAD: "🚴 Szosa",
  GRAVEL: "🚵 Gravel",
  MTB: "🚵‍♂️ MTB",
  OTHER: "🚲 Inny",
};

export const VARIANT_BY_TYPE: Record<string, "default" | "destructive"> = {
  PART_WORN: "destructive",
  PART_NEAR_WORN: "default",
  SERVICE_DUE: "default",
  EMAIL_MISSING: "default",
  SYSTEM: "default",
  NEW_COMMENT: "default",
  COMMENT_REPLY: "default",
}

export interface PartReplacement {
  id: string;
  brand: string | null;
  model: string | null;
  notes: string | null;
  kmAtReplacement: number;
  kmUsed: number;
  createdAt?: Date | string;
  partType?: string;
}

export interface LubeEvent {
  id: string;
  lubricantBrand: string | null;
  lubricantProductId: string | null;
  lubricantProduct?: {
    id: string;
    brand: string;
    model: string;
    specifications: unknown;
    averageRating: number | null;
    totalReviews: number;
  } | null;
  notes: string | null;
  kmAtTime: number;
  createdAt: Date | string;
  // Opinia powiązana z tym smarowaniem
  reviews?: Array<{
    id: string;
    rating: number;
    reviewText: string | null;
  }>;
}

export interface ServiceEvent extends LubeEvent {
  type: string;
}

export interface BikeInfo {
  id: string;
  name: string | null;
  brand: string | null;
  model: string | null;
  totalKm: number;
}

export interface TimelineItem {
  id: string;
  type: "replacement" | "service";
  data: PartReplacement | ServiceEvent;
  createdAt: string;
}

// Nowe interfejsy dla globalnego systemu produktów i opinii
export interface PartProduct {
  id: string;
  type: string;
  brand: string;
  model: string;
  description: string | null;
  officialImageUrl: string | null;
  officialPrice: unknown; // Prisma Decimal type
  averageRating: number | null;
  totalReviews: number;
  averageKmLifespan: number | null;
  totalInstallations: number;
  specifications: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BikeProduct {
  id: string;
  bikeType: BikeType;
  brand: string;
  model: string;
  specifications: Record<string, string> | null;
  description: string | null;
  officialImageUrl: string | null;
  year: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PartReview {
  id: string;
  userId: string;
  partId: string | null;
  serviceEventId: string | null;
  productId: string;
  rating: number;
  reviewText: string | null;
  kmAtReview: number;
  kmUsed: number;
  bikeType: BikeType;
  pros: string[];
  cons: string[];
  verified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PartProductWithStats extends PartProduct {
  reviews?: PartReview[];
}

export interface BikePartWithProduct {
  id: string;
  type: string;
  wearKm: number;
  expectedKm: number;
  productId: string | null;
  installedAt: Date | string | null;
  partSpecificData: unknown;
  product: PartProduct | null;
}