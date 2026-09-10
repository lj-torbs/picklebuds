import { Bell, CheckCircle2, Clock3, XCircle } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NotificationApiItem } from "@/lib/notifications-api"
import { cn } from "@/lib/utils"

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function NotificationsList({
  description,
  error,
  isLoading,
  notifications,
  onMarkRead,
}: {
  description: string
  error: string | null
  isLoading: boolean
  notifications: NotificationApiItem[]
  onMarkRead: (notification: NotificationApiItem) => void
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : isLoading ? (
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            No notifications yet.
          </p>
        ) : (
          notifications.map((notification) => {
            const normalizedTitle = notification.title.toLowerCase()
            const normalizedMessage = notification.message.toLowerCase()
            const isCancellation =
              normalizedTitle.includes("cancel") ||
              normalizedMessage.includes("cancel")
            const Icon = isCancellation
              ? XCircle
              : normalizedTitle.includes("accepted")
              ? CheckCircle2
              : notification.is_read
                ? Bell
                : Clock3

            return (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 rounded-lg border bg-background p-3",
                  isCancellation && "border-destructive/30 bg-destructive/5"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary",
                    isCancellation && "bg-destructive/15 text-destructive"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.is_read ? (
                      <span
                        className={cn(
                          "rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary",
                          isCancellation &&
                            "bg-destructive/15 text-destructive"
                        )}
                      >
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <p className="mr-auto text-xs text-muted-foreground">
                      {formatNotificationTime(notification.created_at)}
                    </p>
                    {notification.action_url ? (
                      <Link
                        to={notification.action_url}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                        onClick={() => onMarkRead(notification)}
                      >
                        Open
                      </Link>
                    ) : null}
                    {!notification.is_read ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkRead(notification)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
