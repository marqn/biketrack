"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  AlertTriangle,
  Wrench,
  MessageSquare,
  Settings,
  CheckCheck,
  Eye,
  Inbox,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABELS: Record<string, string> = {
  PART_WORN: "Zużycie części",
  PART_NEAR_WORN: "Zbliżające się zużycie",
  SERVICE_DUE: "Serwis",
  EMAIL_MISSING: "Brak e-maila",
  SYSTEM: "Systemowe",
  NEW_COMMENT: "Nowy komentarz",
  COMMENT_REPLY: "Odpowiedź na komentarz",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  PART_WORN: AlertTriangle,
  PART_NEAR_WORN: AlertTriangle,
  SERVICE_DUE: Wrench,
  EMAIL_MISSING: Mail,
  SYSTEM: Settings,
  NEW_COMMENT: MessageSquare,
  COMMENT_REPLY: MessageSquare,
};

const TYPE_COLORS: Record<string, string> = {
  PART_WORN: "text-destructive",
  PART_NEAR_WORN: "text-orange-500",
  SERVICE_DUE: "text-blue-500",
  EMAIL_MISSING: "text-yellow-500",
  SYSTEM: "text-muted-foreground",
  NEW_COMMENT: "text-green-500",
  COMMENT_REPLY: "text-green-500",
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "przed chwilą";
  if (minutes < 60) return `${minutes} min temu`;
  if (hours < 24) return `${hours} godz. temu`;
  if (days < 7) return `${days} dn. temu`;

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: days > 365 ? "numeric" : undefined,
  });
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: "UNREAD" | "READ" | "DISMISSED";
  bikeId?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notifications?all=true")
      .then((res) => res.json())
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  function notifyChange() {
    window.dispatchEvent(new CustomEvent("notifications-changed"));
  }

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ" as const } : n))
    );
    notifyChange();
  }

  async function markAllAsRead() {
    const unread = notifications.filter((n) => n.status === "UNREAD");
    await Promise.all(
      unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PATCH" }))
    );
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "READ" as const }))
    );
    notifyChange();
  }

  async function deleteNotification(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notifyChange();
  }

  async function handleViewComment(n: Notification) {
    await markAsRead(n.id);
    if (n.bikeId) {
      const res = await fetch(`/api/bike-slug/${n.bikeId}`);
      const data = await res.json();
      if (data.slug) {
        router.push(`/app/discover/bike/${data.slug}`);
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 lg:px-24">
        <div className="text-center mb-8">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:px-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Wiadomości</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Actions bar */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {unreadCount} nieprzeczytanych
            </p>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Oznacz wszystkie jako przeczytane
            </Button>
          </div>
        )}

        {/* Empty state */}
        {notifications.length === 0 && (
          <div className="text-center py-8">
            <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-1">Brak wiadomości</h2>
            <p className="text-sm text-muted-foreground">
              Tutaj pojawią się powiadomienia o komentarzach, serwisie i zużyciu części.
            </p>
          </div>
        )}

        {/* Notification list */}
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Settings;
            const colorClass = TYPE_COLORS[n.type] ?? "text-muted-foreground";
            const isUnread = n.status === "UNREAD";
            const isComment = n.type === "NEW_COMMENT" || n.type === "COMMENT_REPLY";

            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                  isUnread
                    ? "bg-accent/50 border-accent-foreground/10"
                    : "bg-card border-border"
                }`}
              >
                {/* Icon */}
                <div className={`mt-0.5 shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm ${isUnread ? "font-semibold" : "font-medium"}`}>
                      {n.title}
                    </p>
                    <Badge variant={isUnread ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                      {TYPE_LABELS[n.type] ?? n.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {isComment && n.bikeId && (
                    <Button variant="ghost" size="sm" onClick={() => handleViewComment(n)}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Zobacz
                    </Button>
                  )}
                  {isUnread && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
