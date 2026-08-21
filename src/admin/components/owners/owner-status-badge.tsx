import type { OwnerStatus } from "@/admin/lib/admin-owners-context"
import { cn } from "@/lib/utils"

const statusStyles: Record<OwnerStatus, string> = {
  active: "bg-primary/15 text-primary",
  suspended: "bg-destructive/10 text-destructive",
}

export function OwnerStatusBadge({ status }: { status: OwnerStatus }) {
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
