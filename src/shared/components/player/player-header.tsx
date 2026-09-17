import { useState } from "react"
import { LogOut, UserRound } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button-variants"
import { useAuth } from "@/lib/auth-context"
import { PickleBuddyLogo } from "@/shared/components/brand/picklebuddy-logo"
import { NotificationBellLink } from "@/shared/components/notifications/notification-bell-link"
import { cn } from "@/lib/utils"

type PlayerHeaderProps = {
  token?: string
  eyebrow?: string
}

export function PlayerHeader({ token, eyebrow = "Client booking" }: PlayerHeaderProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  function handleLogout() {
    logout()
    setConfirmingLogout(false)
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/booking" className="flex items-center gap-3">
          <PickleBuddyLogo className="size-10 shadow-sm" />
          <span>
            <span className="block text-base leading-tight font-bold">
              PickleBuddy
            </span>
            <span className="block text-xs text-muted-foreground">{eyebrow}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBellLink token={token} to="/notifications" />
          <Link
            to="/profile"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Profile"
          >
            <UserRound className="size-4" aria-hidden="true" />
          </Link>
          <Link
            to="/my-bookings"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            My bookings
          </Link>
          <div className="relative">
            <button
              type="button"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Log out"
              aria-expanded={confirmingLogout}
              onClick={() => setConfirmingLogout((current) => !current)}
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
            {confirmingLogout ? (
              <div className="absolute right-0 top-11 z-30 w-72 rounded-lg border bg-background p-3 text-sm shadow-lg">
                <p className="font-semibold">Log out?</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  You will need to sign in again before managing bookings or
                  updating your profile.
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "h-8"
                    )}
                    onClick={() => setConfirmingLogout(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={cn(
                      buttonVariants({ variant: "destructive", size: "sm" }),
                      "h-8"
                    )}
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
