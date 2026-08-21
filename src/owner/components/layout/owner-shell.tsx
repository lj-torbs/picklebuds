import { LogOut, Menu } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import { OwnerSidebar } from "@/owner/components/layout/owner-sidebar"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const pageTitles: Record<string, string> = {
  "/owner/dashboard": "Dashboard",
  "/owner/gyms": "My Gyms",
  "/owner/gyms/new": "Add Gym",
  "/owner/transactions": "Transactions",
}

function resolveTitle(pathname: string) {
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }

  // /owner/gyms/:gymId/edit
  if (pathname.startsWith("/owner/gyms/") && pathname.endsWith("/edit")) {
    return "Edit Gym"
  }

  return "Owner"
}

export function OwnerShell() {
  const { owner, logout } = useOwnerAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const title = resolveTitle(location.pathname)

  function handleLogout() {
    logout()
    navigate("/owner/login", { replace: true })
  }

  return (
    <div className="min-h-svh bg-muted/30 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r lg:block">
        <OwnerSidebar />
      </aside>

      <div className="flex min-w-0 min-h-svh flex-col">
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
              <SheetTitle className="sr-only">Owner navigation</SheetTitle>
              <OwnerSidebar />
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold">{title}</h1>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {owner?.email}
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
