import { Link } from "react-router-dom"
import { CalendarCheck, RefreshCw, UsersRound } from "lucide-react"

import { cn } from "@/lib/utils"

type PlayerMode = "booking" | "open-play" | "pasalo"

const modeMeta: Record<
  PlayerMode,
  {
    href: string
    title: string
    description: string
    icon: typeof CalendarCheck
  }
> = {
  booking: {
    href: "/booking",
    title: "Court Booking",
    description: "Reserve courts or rent the full venue.",
    icon: CalendarCheck,
  },
  "open-play": {
    href: "/booking?mode=open-play",
    title: "Open Play",
    description: "Join shared sessions and pay per seat.",
    icon: UsersRound,
  },
  pasalo: {
    href: "/booking?mode=pasalo",
    title: "Pasalo Board",
    description: "Claim player-offered court reservations.",
    icon: RefreshCw,
  },
}

export function PlayerModeStrip({ current }: { current: PlayerMode }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {(Object.keys(modeMeta) as PlayerMode[]).map((mode) => {
        const item = modeMeta[mode]
        const Icon = item.icon
        const active = current === mode

        return (
          <Link
            key={mode}
            to={item.href}
            className={cn(
              "grid gap-2 rounded-lg border bg-background p-4 text-left transition hover:border-primary/50 hover:bg-primary/5",
              active && "border-primary bg-primary/5 ring-3 ring-primary/15"
            )}
            aria-current={active ? "page" : undefined}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground",
                  active && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="font-medium">{item.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </Link>
        )
      })}
    </div>
  )
}
