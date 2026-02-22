"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Pencil,
} from "lucide-react";
import { DeleteButton } from "../_components/DeleteButton";
import { getUsers, deleteUser } from "../_actions/users";

type UserRow = Awaited<ReturnType<typeof getUsers>>[number];
type SortKey =
  | "name"
  | "email"
  | "role"
  | "plan"
  | "bikesCount"
  | "commentsCount"
  | "createdAt";
type SortDir = "asc" | "desc";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const loadUsers = async (searchQuery?: string) => {
    setLoading(true);
    const result = await getUsers({ search: searchQuery || undefined });
    setUsers(result);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = () => {
    loadUsers(search);
  };

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  }

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = (a.name || "").localeCompare(b.name || "", "pl");
      } else if (sortKey === "email") {
        cmp = (a.email || "").localeCompare(b.email || "", "pl");
      } else if (sortKey === "role") {
        cmp = a.role.localeCompare(b.role);
      } else if (sortKey === "plan") {
        cmp = a.plan.localeCompare(b.plan);
      } else if (sortKey === "bikesCount") {
        cmp = a._count.bikes - b._count.bikes;
      } else if (sortKey === "commentsCount") {
        cmp = a._count.bikeComments - b._count.bikeComments;
      } else if (sortKey === "createdAt") {
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, sortKey, sortDir]);

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column)
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  }

  const headerClass = "cursor-pointer select-none hover:text-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Użytkownicy</h1>
        <span className="text-sm text-muted-foreground">
          {users.length} użytkowników
        </span>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Szukaj po nazwie lub emailu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Ładowanie...
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead
                className={headerClass}
                onClick={() => handleSort("name")}
              >
                <span className="inline-flex items-center">
                  Nazwa <SortIcon column="name" />
                </span>
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => handleSort("email")}
              >
                <span className="inline-flex items-center">
                  Email <SortIcon column="email" />
                </span>
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => handleSort("role")}
              >
                <span className="inline-flex items-center">
                  Rola <SortIcon column="role" />
                </span>
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => handleSort("plan")}
              >
                <span className="inline-flex items-center">
                  Plan <SortIcon column="plan" />
                </span>
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => handleSort("bikesCount")}
              >
                <span className="inline-flex items-center">
                  Rowery <SortIcon column="bikesCount" />
                </span>
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => handleSort("commentsCount")}
              >
                <span className="inline-flex items-center">
                  Komentarze <SortIcon column="commentsCount" />
                </span>
              </TableHead>
              <TableHead
                className={headerClass}
                onClick={() => handleSort("createdAt")}
              >
                <span className="inline-flex items-center">
                  Rejestracja <SortIcon column="createdAt" />
                </span>
              </TableHead>
              <TableHead className="w-20">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>
                      {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="hover:underline"
                  >
                    {user.name || "—"}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.email || "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "destructive" : "outline"}
                  >
                    {user.role === "ADMIN" ? "Admin" : "User"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.plan === "PREMIUM" ? "default" : "secondary"
                    }
                  >
                    {user.plan === "PREMIUM" ? "Premium" : "Free"}
                  </Badge>
                </TableCell>
                <TableCell>{user._count.bikes}</TableCell>
                <TableCell>{user._count.bikeComments}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("pl-PL")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteButton
                      id={user.id}
                      onDelete={deleteUser}
                      confirmMessage="Czy na pewno chcesz usunąć tego użytkownika? Wszystkie jego dane (rowery, komentarze, opinie) zostaną usunięte."
                      onSuccess={() => loadUsers(search)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  Brak użytkowników
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
