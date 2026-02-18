"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NumberStepper from "@/components/ui/number-stepper";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ExternalLink, Eye, EyeOff, MessageSquare } from "lucide-react";
import { updateUser, deleteUser } from "../../_actions/users";
import { bikeTypeLabels } from "@/lib/types";
import type { BikeType } from "@/lib/generated/prisma";

const COMMENT_TYPE_LABELS: Record<string, string> = {
  GENERAL: "Ogólny",
  SUGGESTION: "Propozycja",
  QUESTION: "Pytanie",
};

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  plan: string;
  planExpiresAt: string | null;
  weight: number | null;
  bio: string | null;
  profileSlug: string | null;
  lastStravaSync: string | null;
  createdAt: string;
  _count: {
    bikes: number;
    bikeComments: number;
    partReviews: number;
  };
};

type BikeData = {
  id: string;
  brand: string | null;
  model: string | null;
  type: string;
  year: number | null;
  isPublic: boolean;
  isElectric: boolean;
  totalKm: number;
  slug: string | null;
  createdAt: string;
};

type CommentData = {
  id: string;
  content: string;
  type: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  bike: {
    id: string;
    brand: string | null;
    model: string | null;
    slug: string | null;
  };
};

interface UserDetailTabsProps {
  user: UserData;
  bikes: BikeData[];
  comments: CommentData[];
}

export function UserDetailTabs({ user, bikes, comments }: UserDetailTabsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role);
  const [plan, setPlan] = useState(user.plan);
  const [planExpiresAt, setPlanExpiresAt] = useState(
    user.planExpiresAt ? user.planExpiresAt.split("T")[0] : ""
  );
  const [weight, setWeight] = useState(user.weight?.toString() || "");
  const [bio, setBio] = useState(user.bio || "");
  const [profileSlug, setProfileSlug] = useState(user.profileSlug || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateUser(user.id, {
        name: name || null,
        email: email || null,
        role: role as "USER" | "ADMIN",
        plan: plan as "FREE" | "PREMIUM",
        planExpiresAt: planExpiresAt || null,
        weight: weight ? parseInt(weight, 10) : null,
        bio: bio || null,
        profileSlug: profileSlug || null,
      });
      router.refresh();
    });
  }

  function handleDelete() {
    if (
      !confirm(
        "Czy na pewno chcesz usunąć tego użytkownika? Wszystkie jego dane zostaną trwale usunięte."
      )
    )
      return;
    startTransition(async () => {
      await deleteUser(user.id);
      router.push("/admin/users");
    });
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Użytkownicy
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-xl">
            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name || "Bez nazwy"}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant={user.role === "ADMIN" ? "destructive" : "outline"}>
              {user.role}
            </Badge>
            <Badge
              variant={user.plan === "PREMIUM" ? "default" : "secondary"}
            >
              {user.plan}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rejestracja: {new Date(user.createdAt).toLocaleDateString("pl-PL")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profil">
        <TabsList>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="rowery">Rowery ({bikes.length})</TabsTrigger>
          <TabsTrigger value="komentarze">
            Komentarze ({comments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Edytuj profil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nazwa</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rola</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan</Label>
                    <Select value={plan} onValueChange={setPlan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planExpiresAt">Wygaśnięcie planu</Label>
                    <Input
                      id="planExpiresAt"
                      type="date"
                      value={planExpiresAt}
                      onChange={(e) => setPlanExpiresAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Waga (kg)</Label>
                    <NumberStepper
                      value={weight ? parseInt(weight, 10) : 75}
                      onChange={(v) => setWeight(v.toString())}
                      steps={[1]}
                      min={30}
                      max={200}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileSlug">Slug profilu</Label>
                  <Input
                    id="profileSlug"
                    value={profileSlug}
                    onChange={(e) => setProfileSlug(e.target.value)}
                    placeholder="np. jan-kowalski"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Opis użytkownika..."
                  />
                </div>

                {user.lastStravaSync && (
                  <div className="text-sm text-muted-foreground">
                    Ostatnia synchronizacja Strava:{" "}
                    {new Date(user.lastStravaSync).toLocaleDateString("pl-PL")}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Statystyki: {user._count.bikes} rowerów,{" "}
                  {user._count.bikeComments} komentarzy,{" "}
                  {user._count.partReviews} opinii
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Zapisywanie..." : "Zapisz"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    Usuń użytkownika
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rowery" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rowery ({bikes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {bikes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Użytkownik nie ma rowerów
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marka</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Rok</TableHead>
                      <TableHead>Km</TableHead>
                      <TableHead>Publiczny</TableHead>
                      <TableHead>Dodano</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bikes.map((bike) => (
                      <TableRow
                        key={bike.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          router.push(`/admin/users/bike/${bike.id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          {bike.brand || "—"}
                        </TableCell>
                        <TableCell>{bike.model || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {bikeTypeLabels[bike.type as BikeType] || bike.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{bike.year || "—"}</TableCell>
                        <TableCell>{bike.totalKm} km</TableCell>
                        <TableCell>
                          {bike.isPublic ? (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-green-500" />
                              {bike.slug && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(bike.createdAt).toLocaleDateString("pl-PL")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="komentarze" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Komentarze ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Użytkownik nie napisał komentarzy
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border rounded-md p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {COMMENT_TYPE_LABELS[comment.type] || comment.type}
                          </Badge>
                          {comment.isHidden && (
                            <Badge variant="destructive" className="text-xs">
                              Ukryty
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "pl-PL"
                          )}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>na rowerze</span>
                        {comment.bike.slug ? (
                          <Link
                            href={`/app/discover/bike/${comment.bike.slug}`}
                            className="font-medium hover:underline"
                            target="_blank"
                          >
                            {comment.bike.brand} {comment.bike.model}
                          </Link>
                        ) : (
                          <span className="font-medium">
                            {comment.bike.brand} {comment.bike.model}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
