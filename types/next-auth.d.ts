// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: "google" | "strava" | "credentials" | string;
      plan?: "FREE" | "PREMIUM";
      planExpiresAt?: string | null;
      unitPreference?: "METRIC" | "IMPERIAL";
    };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    provider?: string;
    plan?: "FREE" | "PREMIUM";
    planExpiresAt?: string | null;
    unitPreference?: "METRIC" | "IMPERIAL";
  }
}