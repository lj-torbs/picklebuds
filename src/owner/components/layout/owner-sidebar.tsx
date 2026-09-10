import {
  Building2,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  Bell,
  Receipt,
  Settings2,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"
import { useOwnerBranding } from "@/owner/lib/owner-branding-context"

const navItems = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/gyms", label: "My Gyms", icon: Building2 },
  { to: "/owner/payment-methods", label: "Payment Methods", icon: CreditCard },
  { to: "/owner/transactions", label: "Transactions", icon: Receipt },
  { to: "/owner/notifications", label: "Notifications", icon: Bell },
  { to: "/owner/configuration", label: "Configuration", icon: Settings2 },
]

export function OwnerSidebar({
  onNavigate,
  unreadNotifications = 0,
}: {
  onNavigate?: () => void
  unreadNotifications?: number
}) {
  const { branding, brandLabel } = useOwnerBranding()

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--sidebar) 90%, var(--primary) 10%) 0%, var(--sidebar) 48%, color-mix(in srgb, var(--sidebar) 92%, var(--background) 8%) 100%)",
      }}
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border text-sidebar-foreground",
        branding.density === "compact" ? "gap-5 p-3" : "gap-6 p-4"
      )}
    >
      <div className="grid gap-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              {branding.logoImageUrl ? (
                <img
                  src={branding.logoImageUrl}
                  alt={`${brandLabel} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <CalendarCheck className="size-5" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base leading-tight font-semibold">
                {brandLabel}
              </span>
              <span className="block truncate text-xs text-sidebar-foreground/55">
                Venue management
              </span>
            </span>
          </div>
        </div>

        <div className="h-px bg-sidebar-border" />
      </div>

      <nav className="grid gap-1.5">
        <span className="px-3 pb-1 text-[11px] font-medium text-sidebar-foreground/45 uppercase">
          Manage
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/72 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm before:absolute before:top-2 before:bottom-2 before:left-0 before:w-1 before:rounded-r-full before:bg-sidebar-primary"
              )
            }
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
            {item.to === "/owner/notifications" &&
            unreadNotifications > 0 ? (
              <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] leading-5 font-semibold text-destructive-foreground">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-md border border-sidebar-border/70 px-3 py-2 text-[11px] text-sidebar-foreground/55">
        <span className="block font-medium text-sidebar-foreground/70">
          Powered by PickleBuddy
        </span>
        <span className="mt-0.5 block">White-label venue operations</span>
      </div>
    </div>
  )
}
