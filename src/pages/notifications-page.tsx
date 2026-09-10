import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, UserRound } from "lucide-react"
import { Link } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button-variants"
import { useAuth } from "@/lib/auth-context"
import {
  getNotificationsWithApi,
  markNotificationReadWithApi,
  type NotificationApiItem,
} from "@/lib/notifications-api"
import { NotificationsList } from "@/shared/components/notifications/notifications-list"

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.token) {
      setIsLoading(false)
      return
    }

    let isActive = true

    setIsLoading(true)
    void getNotificationsWithApi(user.token)
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
  }, [user?.token])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  )

  async function handleMarkRead(notification: NotificationApiItem) {
    if (!user?.token || notification.is_read) {
      return
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    )

    try {
      const nextNotification = await markNotificationReadWithApi(
        user.token,
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
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/booking" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base leading-tight font-bold">
                PickleBuddy
              </span>
              <span className="block text-xs text-muted-foreground">
                Notifications
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/booking"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Book court
            </Link>
            <Link
              to="/profile"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Profile"
            >
              <UserRound className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div>
          <p className="text-sm font-medium text-primary">
            {unreadCount} unread
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Booking updates, approval changes, and court reminders appear here.
          </p>
        </div>

        <div className="mt-6">
          <NotificationsList
            description="Live booking updates for your player account."
            error={error}
            isLoading={isLoading}
            notifications={notifications}
            onMarkRead={handleMarkRead}
          />
        </div>
      </section>
    </main>
  )
}
