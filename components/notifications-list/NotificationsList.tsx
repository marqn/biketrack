"use client";

import { useNotifications } from "@/app/hooks/useNotifications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { VARIANT_BY_TYPE } from "@/lib/types";
import { dispatchNotificationAction } from "./dispatchNotificationAction";
import { useState } from "react";

export function NotificationsList() {
  const { notifications, loading, markAsRead } = useNotifications();
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  if (loading) return null;

  const visibleNotifications = notifications.filter(
    (n) => !hiddenIds.includes(n.id)
  );

  if (visibleNotifications.length === 0) return null;

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleNotifications.map((n) => (
        <Alert key={n.id} variant={VARIANT_BY_TYPE[n.type]}>
          <AlertTitle className="flex justify-between items-center">
            {n.title}
          </AlertTitle>
          <AlertDescription>{n.message}</AlertDescription>
            <div className="flex gap-2 absolute right-2 top-1/2 -translate-y-1/2">
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
