"use client"

import { useNotifications } from "@/app/hooks/useNotifications"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { VARIANT_BY_TYPE } from "@/lib/types"

export function NotificationsList() {
  const { notifications, loading, markAsRead } = useNotifications()

  if (loading) return null
  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <Alert key={n.id} variant={VARIANT_BY_TYPE[n.type]}>
          <AlertTitle className="flex justify-between items-center">
            {n.title}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead(n.id)}
            >
              OK
            </Button>
          </AlertTitle>
          <AlertDescription>{n.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
