import type { PaymentStatus, TransactionStatus } from "@/shared/lib/transactions-context"
import { cn } from "@/lib/utils"

const statusStyles: Record<TransactionStatus, string> = {
  confirmed: "bg-primary/15 text-primary",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

const paymentStyles: Record<PaymentStatus, string> = {
  paid: "bg-primary/15 text-primary",
  unpaid: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  refunded: "bg-muted text-muted-foreground",
}

export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus
}) {
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

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium capitalize",
        paymentStyles[status]
      )}
    >
      {status}
    </span>
  )
}
