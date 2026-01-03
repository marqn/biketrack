// import { BikeMaintenanceApp } from "@/components/bike-maintenance-app"

// export default function Page() {
//   return <BikeMaintenanceApp />
// }

// "use client"

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bike } from "lucide-react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export default function Page() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onLogin(email, password)
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl flex justify-center mb-2">
            <div className=" h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                🚴
              </div>
            </div>
          </CardTitle>
          <CardTitle className="text-2xl">BikeTrack</CardTitle>
          <CardDescription>
            Zaloguj się, aby zarządzać serwisem swoich rowerów
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value="twoj@email.pl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Zaloguj się
            </Button>

            <Button className="w-full">Zaloguj przez Google</Button>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Demo: użyj dowolnego emaila i hasła
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
