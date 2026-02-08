"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bike as BikeIcon, Loader2, MapPin, MessageSquare } from "lucide-react";
import { bikeTypeLabels } from "@/lib/types";
import { BikeType } from "@/lib/generated/prisma";
import Link from "next/link";

interface BikeCardProps {
  bike: {
    slug: string | null;
    brand: string | null;
    model: string | null;
    year: number | null;
    type: BikeType;
    isElectric: boolean;
    totalKm: number;
    imageUrl: string | null;
    user?: {
      name: string | null;
      image: string | null;
    };
    _count?: { comments: number };
  };
}

export function BikeCard({ bike }: BikeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!bike.slug) return null;

  const bikeTitle = bike.brand || bike.model
    ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
    : bikeTypeLabels[bike.type];

  return (
    <Link
      href={`/app/discover/bike/${bike.slug}`}
      className="group block bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Miniatura */}
      <div className="relative w-full h-36 bg-muted flex items-center justify-center overflow-hidden">
        {bike.imageUrl ? (
          <>
            {!imageLoaded && (
              <Loader2 className="h-8 w-8 text-muted-foreground/40 animate-spin absolute" />
            )}
            <img
              src={bike.imageUrl}
              alt={bikeTitle}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${!imageLoaded ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <BikeIcon className="h-12 w-12 text-muted-foreground/30" />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold truncate">{bikeTitle}</h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {bikeTypeLabels[bike.type]}
          </Badge>
          {bike.year && (
            <Badge variant="outline" className="text-xs">{bike.year}</Badge>
          )}
          {bike.isElectric && (
            <Badge variant="outline" className="text-xs">E-bike</Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{bike.totalKm.toLocaleString("pl-PL")} km</span>
          </div>
          {bike._count && bike._count.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{bike._count.comments}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
