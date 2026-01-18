// app/onboarding/google/page.tsx
import { getServerSession } from "next-auth";
import { createBike } from "../_actions/createBike";
import BikeTypeSelector from "../_components/BikeTypeSelector";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function FacebookSyncPage() {
   const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Witaj! 🚴</CardTitle>
          <CardTitle className="text-2xl">Jaki masz rower?</CardTitle>
          <CardDescription className="text-base">
            Wybierz typ roweru, a automatycznie dodamy odpowiednie komponenty
            do śledzenia.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <BikeTypeSelector onSelectType={createBike} />
        </CardContent>
      </Card>
    </main>
  );
}