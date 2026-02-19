"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, CalendarDays, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RacesList() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs defaultValue="recommended">
            <TabsList>
              <TabsTrigger value="recommended">Dla Ciebie</TabsTrigger>
              <TabsTrigger value="all">Wszystkie</TabsTrigger>
              <TabsTrigger value="nearby">W pobliżu</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Badge variant="secondary">Gravel</Badge>
            <Badge variant="outline">Szosa</Badge>
            <Badge variant="outline">MTB</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Race card */}
      <Card className="hover:shadow-md transition">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Mazovia Gravel Race</CardTitle>
            <Badge>Gravel</Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              12 maja 2026
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Łódź
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />3 znajomych bierze udział
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">80 km</Badge>
            <Badge variant="secondary">120 km</Badge>
            <Badge variant="secondary">200 km</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Za 9 dni</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Szczegóły
              </Button>
              <Button size="sm" variant="outline">Biorę udział</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button
        variant="link"
        size="sm"
        className="w-full rounded-b-lg border-t"
        onClick={() => router.push("/app")}
      >
        Powrót
      </Button>
    </div>
  );
}
