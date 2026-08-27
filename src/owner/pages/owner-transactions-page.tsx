import { useEffect, useMemo, useState } from "react"

import {
  approveBookingPaymentWithApi,
  completeOwnerBookingWithApi,
  getOwnerTransactionsWithApi,
  type OwnerTransactionApiItem,
} from "@/lib/booking-api"
import { useBookings } from "@/lib/bookings-context"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { TransactionsManager } from "@/shared/components/transactions/transactions-manager"
import { useGyms } from "@/shared/lib/gyms-context"
import type { PaymentReceipt } from "@/shared/lib/payment-receipt"
import type { Transaction } from "@/shared/lib/transactions-context"
import type { TransactionStatus } from "@/shared/lib/transactions-context"
import { useTransactions } from "@/shared/lib/transactions-context"

function mapApiTransactionToTransaction(
  transaction: OwnerTransactionApiItem
): Transaction {
  const paymentReceipt: PaymentReceipt | undefined =
    transaction.reference_number &&
    transaction.sender_account_name &&
    transaction.receipt_file_name &&
    transaction.receipt_image_url &&
    transaction.receipt_uploaded_at
      ? {
          referenceNumber: transaction.reference_number,
          accountName: transaction.sender_account_name,
          fileName: transaction.receipt_file_name,
          imageUrl: transaction.receipt_image_url,
          uploadedAt: transaction.receipt_uploaded_at,
        }
      : undefined

  return {
    id: transaction.public_id,
    customerName: transaction.customer_name,
    customerEmail: transaction.customer_email,
    gymId: transaction.venue_public_id,
    gym: transaction.venue_name,
    courtId: transaction.court_public_id ?? "whole-gym",
    court: transaction.court_name ?? "Whole gym",
    date: transaction.booking_date,
    slots: transaction.slot_labels,
    bookingType: transaction.booking_type,
    participantCount: transaction.participant_count,
    amount: transaction.amount,
    rentals: transaction.rentals.map((rental) => ({
      itemId: rental.rental_item_public_id,
      name: rental.item_name,
      category: rental.category,
      pricePerSession: rental.price_per_session,
      quantity: rental.quantity,
    })),
    paymentMethod: transaction.payment_method_label ?? "Manual payment review",
    paymentStatus: transaction.payment_status,
    status: transaction.status,
    createdAt: transaction.created_at,
    paymentReceipt,
  }
}

export function OwnerTransactionsPage() {
  const { owner } = useOwnerAuth()
  const { gyms } = useGyms()
  const { transactions, setStatus, refund } = useTransactions()
  const { setBookingStatus } = useBookings()
  const [remoteTransactions, setRemoteTransactions] = useState<Transaction[]>([])

  const ownedGymIds = useMemo(
    () => new Set(gyms.filter((gym) => gym.ownerId === owner?.id).map((gym) => gym.id)),
    [gyms, owner]
  )

  const ownedTransactions = useMemo(
    () => transactions.filter((transaction) => ownedGymIds.has(transaction.gymId)),
    [transactions, ownedGymIds]
  )

  useEffect(() => {
    if (!owner?.token) {
      return
    }

    let isActive = true

    void getOwnerTransactionsWithApi(owner.token)
      .then((items) => {
        if (!isActive) {
          return
        }
        setRemoteTransactions(items.map(mapApiTransactionToTransaction))
      })
      .catch(() => {
        if (!isActive) {
          return
        }
        setRemoteTransactions([])
      })

    return () => {
      isActive = false
    }
  }, [owner?.token])

  const liveTransactionIds = useMemo(
    () => new Set(remoteTransactions.map((transaction) => transaction.id)),
    [remoteTransactions]
  )

  const visibleTransactions = useMemo(() => {
    if (!owner?.token) {
      return ownedTransactions
    }
    const localOnly = ownedTransactions.filter(
      (transaction) => !liveTransactionIds.has(transaction.id)
    )
    return [...remoteTransactions, ...localOnly]
  }, [liveTransactionIds, ownedTransactions, owner?.token, remoteTransactions])

  async function handleSetStatus(id: string, status: TransactionStatus) {
    const isLiveTransaction = liveTransactionIds.has(id) && !!owner?.token

    if (isLiveTransaction && status === "confirmed") {
      await approveBookingPaymentWithApi(owner.token!, id)
      setRemoteTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id
            ? { ...transaction, status: "confirmed", paymentStatus: "paid" }
            : transaction
        )
      )
    } else if (isLiveTransaction && status === "completed") {
      await completeOwnerBookingWithApi(owner.token!, id)
      setRemoteTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id
            ? { ...transaction, status: "completed" }
            : transaction
        )
      )
    }

    setStatus(id, status)
    setBookingStatus(id, status)
  }

  async function handleRefund(id: string) {
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
        transactions={visibleTransactions}
        enableReporting
        onSetStatus={handleSetStatus}
        onRefund={handleRefund}
      />
    </div>
  )
}
