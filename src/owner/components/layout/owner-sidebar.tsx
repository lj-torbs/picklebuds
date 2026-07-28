import { Building2, CalendarCheck, LayoutDashboard, Receipt } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

const navItems = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/gyms", label: "My Gyms", icon: Building2 },
  { to: "/owner/transactions", label: "Transactions", icon: Receipt },
]

export function OwnerSidebar({ onNavigate }: { onNavigate?: () => void }) {
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
            Owner console
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
