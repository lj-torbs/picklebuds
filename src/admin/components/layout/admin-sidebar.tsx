import {
  Building2,
  CalendarCheck,
  LayoutDashboard,
  Receipt,
  UsersRound,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt },
  { to: "/admin/gyms", label: "Gyms & Courts", icon: Building2 },
  { to: "/admin/users", label: "Users", icon: UsersRound },
]

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <div className="flex items-center gap-3 px-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <CalendarCheck className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-base leading-tight font-bold">
            PickleBuddy
          </span>
          <span className="block text-xs text-sidebar-foreground/60">
            Admin console
          </span>
        </span>
      </div>

      <nav className="grid gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
