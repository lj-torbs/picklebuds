import { useBookings } from "@/lib/bookings-context"
import { TransactionsManager } from "@/shared/components/transactions/transactions-manager"
import type { TransactionStatus } from "@/shared/lib/transactions-context"
import { useTransactions } from "@/shared/lib/transactions-context"

export function AdminTransactionsPage() {
  const { transactions, setStatus, refund } = useTransactions()
  const { setBookingStatus } = useBookings()

  function handleSetStatus(id: string, status: TransactionStatus) {
    setStatus(id, status)
    setBookingStatus(id, status)
  }

  function handleRefund(id: string) {
    refund(id)
    setBookingStatus(id, "cancelled")
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Transactions</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Manage bookings and payments
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Search, filter, and update the status of any booking transaction
          across every gym on the platform.
        </p>
      </div>

      <TransactionsManager
        transactions={transactions}
        onSetStatus={handleSetStatus}
        onRefund={handleRefund}
      />
    </div>
  )
}
