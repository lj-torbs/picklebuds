import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Info,
  UserRound,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const notifications = [
  {
    icon: CheckCircle2,
    title: "Booking confirmed",
    message: "Northside Pickleball Gym confirmed Court B for July 12.",
    time: "8 min ago",
    unread: true,
  },
  {
    icon: Clock3,
    title: "Pending approval",
    message: "Central Court Club is reviewing your selected time slots.",
    time: "1 hr ago",
    unread: true,
  },
  {
    icon: Info,
    title: "Court reminder",
    message: "Riverside Sports Center asks players to arrive 10 minutes early.",
    time: "Yesterday",
    unread: false,
  },
]

export function NotificationsPage() {
  const unreadCount = notifications.filter((notification) => notification.unread).length

  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">PickleBuddy</span>
              <span className="block text-xs text-muted-foreground">Notifications</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a href="/booking" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Book court
            </a>
            <a
              href="/profile"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Profile"
            >
              <UserRound className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div>
          <p className="text-sm font-medium text-primary">{unreadCount} unread</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Booking updates, approval changes, and court reminders will appear here.
          </p>
        </div>

        <Card className="mt-6 rounded-lg">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Frontend sample notifications for the client account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {notifications.map((notification) => (
              <div
                key={notification.title}
                className="flex gap-3 rounded-lg border bg-background p-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <notification.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {notification.unread ? (
                      <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
