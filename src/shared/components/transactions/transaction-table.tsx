import { Eye } from "lucide-react"

import {
  PaymentStatusBadge,
  TransactionStatusBadge,
} from "@/shared/components/transactions/transaction-status-badge"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/shared/lib/transactions-context"
import { Button } from "@/components/ui/button"

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getAdvanceBookingDays(dateValue: string) {
  const bookingDate = parseDateValue(dateValue)

  if (!bookingDate) {
    return 0
  }

  const today = startOfLocalDay(new Date())
  const bookingDay = startOfLocalDay(bookingDate)
  return Math.round(
    (bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
}

function getAdvanceBookingLabel(daysAhead: number) {
  if (daysAhead >= 60) {
    return `${Math.floor(daysAhead / 30)} mo advance`
  }

  if (daysAhead >= 30) {
    return "1 mo advance"
  }

  if (daysAhead >= 14) {
    return `${Math.floor(daysAhead / 7)} wk advance`
  }

  if (daysAhead >= 7) {
    return "1 wk advance"
  }

  return null
}

export function TransactionTable({
  transactions,
  onView,
  highlightedTransactionId,
}: {
  transactions: Transaction[]
  onView: (transaction: Transaction) => void
  highlightedTransactionId?: string | null
}) {
  if (transactions.length === 0) {
    return (
      <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        No transactions match your search or filters.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-[11px] uppercase text-muted-foreground">
            <th className="px-4 py-3 font-medium">Transaction</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Gym / court</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.map((transaction) => {
            const isHighlighted = highlightedTransactionId === transaction.id
            const daysAhead = getAdvanceBookingDays(transaction.date)
            const advanceBookingLabel = getAdvanceBookingLabel(daysAhead)
            return (
            <tr
              key={transaction.id}
              className={cn(
                "transition-colors hover:bg-muted/10",
                transaction.status === "cancelled" && "bg-destructive/5",
                isHighlighted &&
                  transaction.status !== "cancelled" &&
                  "bg-primary/15 ring-2 ring-inset ring-primary/50",
                isHighlighted &&
                  transaction.status === "cancelled" &&
                  "bg-destructive/15 ring-2 ring-inset ring-destructive/50"
              )}
            >
              <td className="px-4 py-2.5">
                <div className="grid gap-1">
                  <span className="font-medium">{transaction.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {transaction.paymentReceipt?.referenceNumber ?? "No reference"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <div className="font-medium">{transaction.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {transaction.customerEmail}
                </div>
              </td>
              <td className="px-4 py-2.5">
                <div className="font-medium">{transaction.gym}</div>
                <div className="text-xs text-muted-foreground">
                  {transaction.court}
                </div>
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span>{transaction.date}</span>
                    {advanceBookingLabel ? (
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-medium",
                          daysAhead >= 30
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-500/10 text-amber-700"
                        )}
                      >
                        {advanceBookingLabel}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {transaction.slots.join(", ")}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5 font-medium">{formatCurrency(transaction.amount)}</td>
              <td className="px-4 py-2.5">
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {transaction.paymentMethod}
                  </span>
                  <PaymentStatusBadge status={transaction.paymentStatus} />
                </div>
              </td>
              <td className="px-4 py-2.5">
                <TransactionStatusBadge status={transaction.status} />
              </td>
              <td className="px-4 py-2.5 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`View ${transaction.id}`}
                  onClick={() => onView(transaction)}
                >
                  <Eye className="size-4" aria-hidden="true" />
                </Button>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
