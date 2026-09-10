import { useCallback, useEffect, useRef, useState } from "react"

import {
  getNotificationsWithApi,
  markNotificationReadWithApi,
  type NotificationApiItem,
} from "@/lib/notifications-api"

export function useNotifications({
  token,
  intervalMs = 30000,
  onNewUnread,
}: {
  token?: string
  intervalMs?: number
  onNewUnread?: (notification: NotificationApiItem) => void
}) {
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const knownUnreadIdsRef = useRef<Set<number>>(new Set())
  const hasLoadedRef = useRef(false)
  const onNewUnreadRef = useRef(onNewUnread)

  useEffect(() => {
    onNewUnreadRef.current = onNewUnread
  }, [onNewUnread])

  const refresh = useCallback(async () => {
    if (!token) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    try {
      const items = await getNotificationsWithApi(token)
      const nextUnreadIds = new Set(
        items
          .filter((notification) => !notification.is_read)
          .map((notification) => notification.id)
      )

      if (hasLoadedRef.current && onNewUnreadRef.current) {
        for (const notification of items) {
          if (
            !notification.is_read &&
            !knownUnreadIdsRef.current.has(notification.id)
          ) {
            onNewUnreadRef.current(notification)
          }
        }
      }

      knownUnreadIdsRef.current = nextUnreadIds
      hasLoadedRef.current = true
      setNotifications(items)
      setError(null)
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load notifications."
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    setIsLoading(true)
    hasLoadedRef.current = false
    knownUnreadIdsRef.current = new Set()
    void refresh()

    if (!token || intervalMs <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      void refresh()
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [intervalMs, refresh, token])

  const markRead = useCallback(
    async (notification: NotificationApiItem) => {
      if (!token || notification.is_read) {
        return
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      )
      knownUnreadIdsRef.current.delete(notification.id)

      try {
        const nextNotification = await markNotificationReadWithApi(
          token,
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
        knownUnreadIdsRef.current.add(notification.id)
      }
    },
    [token]
  )

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.is_read)
      .length,
    isLoading,
    error,
    markRead,
    refresh,
  }
}
