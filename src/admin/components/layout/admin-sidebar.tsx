import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Receipt,
  UsersRound,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt },
  { to: "/admin/owners", label: "Owners", icon: UsersRound },
]

export function AdminSidebar({
  collapsed = false,
  onNavigate,
  onToggleCollapsed,
}: {
  collapsed?: boolean
  onNavigate?: () => void
  onToggleCollapsed?: () => void
}) {
  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <div
        className={cn(
          "flex items-center gap-2",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-3 px-2",
            collapsed && "hidden"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <CalendarCheck className="size-5" aria-hidden="true" />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-base leading-tight font-bold">
                PickleBuddy
              </span>
              <span className="block truncate text-xs text-sidebar-foreground/60">
                Admin console
              </span>
            </span>
          ) : null}
        </div>

        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/70 text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      <nav className="grid gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="size-4" aria-hidden="true" />
            {!collapsed ? item.label : null}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
