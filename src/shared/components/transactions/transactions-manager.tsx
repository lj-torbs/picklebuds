import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { TransactionDetailSheet } from "@/shared/components/transactions/transaction-detail-sheet"
import { TransactionTable } from "@/shared/components/transactions/transaction-table"
import type { Transaction, TransactionStatus } from "@/shared/lib/transactions-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const statusFilters: { value: TransactionStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

function transactionMatchesQuery(transaction: Transaction, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    transaction.id.toLowerCase().includes(normalizedQuery) ||
    transaction.customerName.toLowerCase().includes(normalizedQuery) ||
    transaction.customerEmail.toLowerCase().includes(normalizedQuery) ||
    transaction.gym.toLowerCase().includes(normalizedQuery)
  )
}

export function TransactionsManager({
  transactions,
  searchPlaceholder = "Search by ID, customer, or gym",
  onSetStatus,
  onRefund,
}: {
  transactions: Transaction[]
  searchPlaceholder?: string
  onSetStatus: (id: string, status: TransactionStatus) => void
  onRefund: (id: string) => void
}) {
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  )
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null)

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          (statusFilter === "all" || transaction.status === statusFilter) &&
          transactionMatchesQuery(transaction, searchQuery)
      ),
    [transactions, statusFilter, searchQuery]
  )

  const selectedTransaction =
    transactions.find((transaction) => transaction.id === selectedTransactionId) ??
    null

  function handleStatusChange(id: string, status: TransactionStatus) {
    onSetStatus(id, status)
    toast.add({
      title: "Transaction updated",
      description: `${id} marked as ${status}.`,
      type: "success",
    })
  }

  function handleRefund(id: string) {
    onRefund(id)
    toast.add({
      title: "Payment refunded",
      description: `${id} has been refunded and cancelled.`,
      type: "success",
    })
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-8"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={statusFilter === filter.value ? "default" : "outline"}
              className={cn(
                statusFilter === filter.value && "pointer-events-none"
              )}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <TransactionTable
        transactions={filteredTransactions}
        onView={(transaction) => setSelectedTransactionId(transaction.id)}
      />

      <TransactionDetailSheet
        transaction={selectedTransaction}
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransactionId(null)
          }
        }}
        onConfirm={(id) => handleStatusChange(id, "confirmed")}
        onComplete={(id) => handleStatusChange(id, "completed")}
        onCancel={(id) => handleStatusChange(id, "cancelled")}
        onRefund={handleRefund}
      />
    </div>
  )
}
