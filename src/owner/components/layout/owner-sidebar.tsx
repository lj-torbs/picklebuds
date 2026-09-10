import {
  Building2,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings2,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"
import { useOwnerBranding } from "@/owner/lib/owner-branding-context"

export const ownerNavItems = [
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
  collapsed = false,
  onCollapsedChange,
}: {
  onNavigate?: () => void
  unreadNotifications?: number
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
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
        collapsed ? "items-center gap-4 p-3" : null,
        !collapsed && branding.density === "compact" ? "gap-5 p-3" : null,
        !collapsed && branding.density !== "compact" ? "gap-6 p-4" : null
      )}
    >
      <div className="grid gap-4">
        <div className="grid gap-3">
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
                collapsed ? "size-10" : "size-12"
              )}
            >
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
            <span className={cn("min-w-0", collapsed && "sr-only")}>
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

      {onCollapsedChange ? (
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn(
            "flex items-center rounded-md text-sm font-medium text-sidebar-foreground/72 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "size-10 justify-center" : "gap-2 px-3 py-2"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      ) : null}

      <nav className={cn("grid gap-1.5", collapsed && "justify-items-center")}>
        <span
          className={cn(
            "px-3 pb-1 text-[11px] font-medium text-sidebar-foreground/45 uppercase",
            collapsed && "sr-only"
          )}
        >
          Manage
        </span>
        {ownerNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center rounded-md text-sm font-medium text-sidebar-foreground/72 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed
                  ? "size-10 justify-center"
                  : "gap-2.5 px-3 py-2.5",
                isActive &&
                  cn(
                    "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
                    !collapsed &&
                      "before:absolute before:top-2 before:bottom-2 before:left-0 before:w-1 before:rounded-r-full before:bg-sidebar-primary"
                  )
              )
            }
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed ? item.label : <span className="sr-only">{item.label}</span>}
            {item.to === "/owner/notifications" &&
            unreadNotifications > 0 ? (
              <span
                className={cn(
                  "flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] leading-5 font-semibold text-destructive-foreground",
                  collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                )}
              >
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          "mt-auto rounded-md border border-sidebar-border/70 px-3 py-2 text-[11px] text-sidebar-foreground/55",
          collapsed && "sr-only"
        )}
      >
        <span className="block font-medium text-sidebar-foreground/70">
          Powered by PickleBuddy
        </span>
        <span className="mt-0.5 block">White-label venue operations</span>
      </div>
    </div>
  )
}

export function OwnerHeaderNav({
  unreadNotifications = 0,
}: {
  unreadNotifications?: number
}) {
  return (
    <nav className="hidden min-w-0 flex-1 items-center justify-end gap-1 lg:flex">
      {ownerNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "relative inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground xl:px-3",
              isActive && "bg-primary/10 text-primary"
            )
          }
        >
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden xl:inline">{item.label}</span>
          <span className="sr-only xl:hidden">{item.label}</span>
          {item.to === "/owner/notifications" && unreadNotifications > 0 ? (
            <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-destructive-foreground ring-2 ring-card">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}
