"use client";

import { useNotifications } from "@/app/hooks/useNotifications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { VARIANT_BY_TYPE } from "@/lib/types";
import { dispatchNotificationAction } from "./dispatchNotificationAction";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NotificationsList() {
  const { notifications, loading, markAsRead } = useNotifications();
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const router = useRouter();

  if (loading) return null;

  const visibleNotifications = notifications.filter(
    (n) => !hiddenIds.includes(n.id)
  );

  if (visibleNotifications.length === 0) return null;

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleNotifications.map((n) => (
        <Alert key={n.id} variant={VARIANT_BY_TYPE[n.type]} className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <AlertTitle>{n.title}</AlertTitle>
            <AlertDescription>{n.message}</AlertDescription>
          </div>
          <div className="flex shrink-0 pt-1">
            {n.type === "EMAIL_MISSING" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setHiddenIds((prev) => [...prev, n.id]);
                  dispatchNotificationAction(n.type);
                }}
              >
                Dodaj e-maila
              </Button>
            ) : n.type === "NEW_COMMENT" || n.type === "COMMENT_REPLY" ? (
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    markAsRead(n.id);
                    if (n.bikeId) {
                      const res = await fetch(`/api/bike-slug/${n.bikeId}`);
                      const data = await res.json();
                      if (data.slug) {
                        router.push(`/app/discover/bike/${data.slug}`);
                      }
                    }
                  }}
                >
                  Zobacz
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(n.id)}
                >
                  OK
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(n.id)}
              >
                OK
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
}
