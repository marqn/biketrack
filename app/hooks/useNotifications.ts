"use client"

import { useCallback, useEffect, useState } from "react"

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    const handler = () => refetch()
    window.addEventListener("notifications-changed", handler)
    return () => window.removeEventListener("notifications-changed", handler)
  }, [refetch])

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return { notifications, loading, markAsRead }
}
