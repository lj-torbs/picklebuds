import type { PlayerStatus } from "@/admin/lib/admin-users-context"
import { cn } from "@/lib/utils"

const statusStyles: Record<PlayerStatus, string> = {
  active: "bg-primary/15 text-primary",
  suspended: "bg-destructive/10 text-destructive",
}

export function UserStatusBadge({ status }: { status: PlayerStatus }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium capitalize",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  )
}
