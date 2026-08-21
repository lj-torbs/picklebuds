import { useMemo } from "react"

import { useBookings } from "@/lib/bookings-context"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { TransactionsManager } from "@/shared/components/transactions/transactions-manager"
import { useGyms } from "@/shared/lib/gyms-context"
import type { TransactionStatus } from "@/shared/lib/transactions-context"
import { useTransactions } from "@/shared/lib/transactions-context"

export function OwnerTransactionsPage() {
  const { owner } = useOwnerAuth()
  const { gyms } = useGyms()
  const { transactions, setStatus, refund } = useTransactions()
  const { setBookingStatus } = useBookings()

  const ownedGymIds = useMemo(
    () => new Set(gyms.filter((gym) => gym.ownerId === owner?.id).map((gym) => gym.id)),
    [gyms, owner]
  )

  const ownedTransactions = useMemo(
    () => transactions.filter((transaction) => ownedGymIds.has(transaction.gymId)),
    [transactions, ownedGymIds]
  )

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
          Bookings at your venues
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Search, filter, and update the status of bookings made at your
          gyms.
        </p>
      </div>

      <TransactionsManager
        transactions={ownedTransactions}
        enableReporting
        onSetStatus={handleSetStatus}
        onRefund={handleRefund}
      />
    </div>
  )
}
