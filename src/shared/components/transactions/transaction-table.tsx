import { Eye } from "lucide-react"

import {
  PaymentStatusBadge,
  TransactionStatusBadge,
} from "@/shared/components/transactions/transaction-status-badge"
import type { Transaction } from "@/shared/lib/transactions-context"
import { Button } from "@/components/ui/button"

export function TransactionTable({
  transactions,
  onView,
}: {
  transactions: Transaction[]
  onView: (transaction: Transaction) => void
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
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-muted/10">
              <td className="px-4 py-2.5">
                <div className="grid gap-1">
                  <span className="font-medium">{transaction.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {transaction.referenceNumber}
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
                  <span>{transaction.date}</span>
                  <span className="text-xs text-muted-foreground">
                    {transaction.time}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5 font-medium">${transaction.amount}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
