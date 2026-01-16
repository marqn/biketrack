"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CalendarCard() {
  const router = useRouter();
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Nadchodzące wydarzenia
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/app/test/races")}
        >
          Zobacz wszystko
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ustawka */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Gravelowa ustawka</span>
              <Badge variant="secondary">Ustawka</Badge>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Las Kabacki · jutro 18:00
            </div>
          </div>
          <Button size="sm">Dołącz</Button>
        </div>

        {/* Zawody */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">Mazovia Gravel Race</span>
              <Badge>Zawody</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              za 5 dni · dystans 120 km
            </div>
          </div>
          <Button variant="outline" size="sm">
            Szczegóły
          </Button>
        </div>

        {/* Propozycja */}
        <div className="rounded-lg border p-3 text-sm">
          💡 <span className="font-medium">Propozycja:</span> W ten weekend
          idealne warunki na długą jazdę 🚴‍♂️
        </div>
      </CardContent>
    </Card>
  );
}
