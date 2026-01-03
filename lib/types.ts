export interface User {
  id: string
  name: string
  email: string
  plan: "free" | "premium"
}

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
  name: string
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
