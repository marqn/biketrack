"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bike, Wrench, Home, Flag, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/bikes", label: "Rowery", icon: Bike },
  { href: "/admin/parts", label: "Czesci", icon: Wrench },
  { href: "/admin/moderation", label: "Moderacja", icon: Flag },
  { href: "/admin/users", label: "Użytkownicy", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t mt-6">
        <Link
          href="/app"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Wroc do aplikacji
        </Link>
      </div>
    </aside>
  );
}
