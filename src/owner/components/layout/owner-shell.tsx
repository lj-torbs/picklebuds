import { LogOut, Menu } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"

import { OwnerSidebar } from "@/owner/components/layout/owner-sidebar"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import {
  buildOwnerBrandingStyle,
  useOwnerBranding,
} from "@/owner/lib/owner-branding-context"
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
  "/owner/configuration": "Configuration",
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
  const { branding } = useOwnerBranding()
  const location = useLocation()
  const navigate = useNavigate()

  const title = resolveTitle(location.pathname)
  const shellStyle = buildOwnerBrandingStyle(branding)

  function handleLogout() {
    logout()
    navigate("/owner/login", { replace: true })
  }

  return (
    <div
      style={shellStyle}
      className="min-h-svh bg-background lg:grid lg:grid-cols-[17rem_1fr]"
    >
      <aside className="hidden lg:block">
        <OwnerSidebar />
      </aside>

      <div className="flex min-h-svh min-w-0 flex-col">
        <header className="relative flex min-h-16 items-center gap-3 border-b bg-card px-4 py-3 shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary sm:px-6">
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

          <h1 className="min-w-0 truncate text-lg font-semibold">{title}</h1>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden min-w-0 rounded-md border bg-background px-3 py-2 shadow-xs sm:block">
              <span className="block text-[11px] font-medium text-muted-foreground uppercase">
                Signed in
              </span>
              <span className="block max-w-56 truncate text-sm">
                {owner?.email}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </Button>
          </div>
        </header>

        <main
          className={
            branding.density === "compact"
              ? "flex-1 px-4 py-5 sm:px-5"
              : "flex-1 px-4 py-6 sm:px-6"
          }
        >
          <Outlet />
        </main>

        <footer className="border-t bg-background/90 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          Powered by PickleBuddy
        </footer>
      </div>
    </div>
  )
}
