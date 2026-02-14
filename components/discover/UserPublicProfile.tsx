"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { BikeCard } from "./BikeCard";
import { BikeType } from "@/lib/generated/prisma";

interface UserPublicProfileProps {
  user: {
    name: string | null;
    image: string | null;
    bio: string | null;
  };
  bikes: Array<{
    slug: string | null;
    brand: string | null;
    model: string | null;
    year: number | null;
    type: BikeType;
    isElectric: boolean;
    totalKm: number;
    images?: string[];
    imageUrl?: string | null;
    _count: { comments: number };
  }>;
}

export function UserPublicProfile({ user, bikes }: UserPublicProfileProps) {
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  const totalKm = bikes.reduce((sum, b) => sum + b.totalKm, 0);

  return (
    <div className="space-y-6">
      {/* Profil */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name ?? "Użytkownik"}</h1>
            {user.bio && (
              <p className="text-muted-foreground mt-1">{user.bio}</p>
            )}
          </div>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">{bikes.length}</span>{" "}
            {bikes.length === 1 ? "rower" : "rowerów"}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">
              {totalKm.toLocaleString("pl-PL")}
            </span>{" "}
            km łącznie
          </div>
        </div>
      </div>

      {/* Rowery */}
      {bikes.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Rowery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bikes.map((bike) => (
              <BikeCard key={bike.slug} bike={bike} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Ten użytkownik nie ma jeszcze publicznych rowerów.
        </div>
      )}
    </div>
  );
}
