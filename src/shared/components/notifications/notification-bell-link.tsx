import { Bell } from "lucide-react"
import { Link } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/shared/lib/use-notifications"

export function NotificationBellLink({
  token,
  to,
  className,
}: {
  token?: string
  to: string
  className?: string
}) {
  const { unreadCount } = useNotifications({ token, intervalMs: 30000 })

  return (
    <Link
      to={to}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "relative",
        className
      )}
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
    >
      <Bell className="size-4" aria-hidden="true" />
      {unreadCount > 0 ? (
        <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-destructive-foreground ring-2 ring-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}
