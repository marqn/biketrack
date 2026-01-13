"use client"

import { useEffect, useState } from "react"

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return { notifications, loading, markAsRead }
}
