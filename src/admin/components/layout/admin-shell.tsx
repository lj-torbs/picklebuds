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

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/transactions": "Transactions",
  "/admin/gyms": "Gyms & Courts",
  "/admin/users": "Users",
}

export function AdminShell() {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const title = pageTitles[location.pathname] ?? "Admin"

  function handleLogout() {
    logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="min-h-svh bg-muted/30 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r lg:block">
        <AdminSidebar />
      </aside>

      <div className="flex min-h-svh flex-col">
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

          <h1 className="text-lg font-semibold">{title}</h1>

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

        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
