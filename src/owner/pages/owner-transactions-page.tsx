import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import {
  approveBookingPaymentWithApi,
  cancelOwnerBookingWithApi,
  completeOwnerBookingWithApi,
  rejectBookingPaymentWithApi,
  refundOwnerBookingWithApi,
} from "@/lib/booking-api"
import {
  getOwnerTransactionsWithApi,
  type OwnerTransactionApiItem,
} from "@/lib/owner-api"
import { useBookings } from "@/lib/bookings-context"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { TransactionsManager } from "@/shared/components/transactions/transactions-manager"
import type { PaymentReceipt } from "@/shared/lib/payment-receipt"
import type { Transaction } from "@/shared/lib/transactions-context"
import type { TransactionStatus } from "@/shared/lib/transactions-context"

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
  const { setBookingStatus } = useBookings()
  const [searchParams, setSearchParams] = useSearchParams()
  const [remoteTransactions, setRemoteTransactions] = useState<Transaction[]>(
    []
  )
  const [highlightedTransactionId, setHighlightedTransactionId] = useState<
    string | null
  >(null)

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
  const visibleTransactions = remoteTransactions
  const focusTransactionId = searchParams.get("focus")

  useEffect(() => {
    if (!focusTransactionId) {
      return
    }

    setHighlightedTransactionId(focusTransactionId)
    const timeoutId = window.setTimeout(() => {
      setHighlightedTransactionId(null)
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.delete("focus")
          return next
        },
        { replace: true }
      )
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [focusTransactionId, setSearchParams])

  async function handleSetStatus(id: string, status: TransactionStatus) {
    const isLiveTransaction = liveTransactionIds.has(id) && !!owner?.token
    const currentTransaction = visibleTransactions.find(
      (transaction) => transaction.id === id
    )

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
    } else if (isLiveTransaction && status === "cancelled") {
      if (currentTransaction?.status === "pending") {
        await rejectBookingPaymentWithApi(owner.token!, id)
        setRemoteTransactions((current) =>
          current.map((transaction) =>
            transaction.id === id
              ? { ...transaction, status: "cancelled", paymentStatus: "unpaid" }
              : transaction
          )
        )
      } else {
        await cancelOwnerBookingWithApi(owner.token!, id)
        setRemoteTransactions((current) =>
          current.map((transaction) =>
            transaction.id === id
              ? { ...transaction, status: "cancelled" }
              : transaction
          )
        )
      }
    }
    setBookingStatus(id, status)
  }

  async function handleRefund(id: string) {
    const isLiveTransaction = liveTransactionIds.has(id) && !!owner?.token

    if (isLiveTransaction) {
      await refundOwnerBookingWithApi(owner.token!, id)
      setRemoteTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                status: "cancelled",
                paymentStatus: "refunded",
              }
            : transaction
        )
      )
    }
    setBookingStatus(id, "cancelled")
  }

  return (
    <div className="grid gap-6">
      <TransactionsManager
        transactions={visibleTransactions}
        enableReporting
        highlightedTransactionId={highlightedTransactionId}
        onSetStatus={handleSetStatus}
        onRefund={handleRefund}
      />
    </div>
  )
}
