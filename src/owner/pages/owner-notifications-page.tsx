import { useEffect, useState } from "react"

import {
  getNotificationsWithApi,
  markNotificationReadWithApi,
  type NotificationApiItem,
} from "@/lib/notifications-api"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { NotificationsList } from "@/shared/components/notifications/notifications-list"

export function OwnerNotificationsPage() {
  const { owner } = useOwnerAuth()
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!owner?.token) {
      setIsLoading(false)
      return
    }

    let isActive = true

    setIsLoading(true)
    void getNotificationsWithApi(owner.token)
      .then((items) => {
        if (!isActive) {
          return
        }
        setNotifications(items)
        setError(null)
      })
      .catch((nextError) => {
        if (!isActive) {
          return
        }
        setNotifications([])
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load notifications."
        )
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [owner?.token])

  async function handleMarkRead(notification: NotificationApiItem) {
    if (!owner?.token || notification.is_read) {
      return
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    )

    try {
      const nextNotification = await markNotificationReadWithApi(
        owner.token,
        notification.id
      )
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? nextNotification : item
        )
      )
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: false } : item
        )
      )
    }
  }

  return (
    <div className="grid gap-6">
      <NotificationsList
        description="Live alerts scoped to your owned gyms and courts."
        error={error}
        isLoading={isLoading}
        notifications={notifications}
        onMarkRead={handleMarkRead}
      />
    </div>
  )
}
