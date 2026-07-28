import type { CourtStatus, GymStatus } from "@/shared/lib/gyms-context"
import { cn } from "@/lib/utils"

const gymStatusStyles: Record<GymStatus, string> = {
  active: "bg-primary/15 text-primary",
  inactive: "bg-muted text-muted-foreground",
}

const courtStatusStyles: Record<CourtStatus, string> = {
  available: "bg-primary/15 text-primary",
  maintenance: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
}

export function GymStatusBadge({ status }: { status: GymStatus }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium capitalize",
        gymStatusStyles[status]
      )}
    >
      {status}
    </span>
  )
}

export function CourtStatusBadge({ status }: { status: CourtStatus }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium capitalize",
        courtStatusStyles[status]
      )}
    >
      {status}
    </span>
  )
}
