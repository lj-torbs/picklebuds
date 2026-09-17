import { useState } from "react"
import { LogOut, Menu } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import { AdminSidebar } from "@/admin/components/layout/admin-sidebar"
import { useAdminAuth } from "@/admin/lib/admin-auth-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { PickleBuddyLogo } from "@/shared/components/brand/picklebuddy-logo"

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/transactions": "Transactions",
  "/admin/owners": "Owners",
}

export function AdminShell() {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const title =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith("/admin/owners/")
      ? "Owner profile"
      : "Admin")

  function handleLogout() {
    logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div
      className={cn(
        "min-h-svh overflow-x-hidden bg-muted/30 lg:grid",
        sidebarCollapsed
          ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]"
          : "lg:grid-cols-[16rem_minmax(0,1fr)]"
      )}
    >
      <aside className="hidden border-r lg:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() =>
            setSidebarCollapsed((current) => !current)
          }
        />
      </aside>

      <div className="flex min-h-svh min-w-0 flex-col overflow-x-hidden">
        <header className="flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 items-center gap-3">
            <PickleBuddyLogo className="size-9 shadow-xs lg:hidden" />
            <h1 className="truncate text-lg font-semibold">{title}</h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {admin?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </Button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
