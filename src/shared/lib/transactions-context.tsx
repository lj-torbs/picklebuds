/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import {
  createMockPaymentReceipt,
  type PaymentReceipt,
} from "@/shared/lib/payment-receipt"

export type TransactionStatus =
  "confirmed" | "pending" | "completed" | "cancelled"
export type PaymentStatus = "paid" | "unpaid" | "refunded"
export type TransactionType = "private" | "open_play" | "whole_gym"

export type Transaction = {
  id: string
  customerName: string
  customerEmail: string
  gymId: string
  gym: string
  courtId: string
  court: string
  date: string
  slots: string[]
  bookingType: TransactionType
  participantCount: number
  amount: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  status: TransactionStatus
  createdAt: string
  paymentReceipt?: PaymentReceipt
}

type NewTransaction = Omit<Transaction, "createdAt"> & {
  createdAt?: string
}

type TransactionsContextValue = {
  transactions: Transaction[]
  addTransaction: (transaction: NewTransaction) => void
  setStatus: (id: string, status: TransactionStatus) => void
  refund: (id: string) => void
}

const initialTransactions: Transaction[] = [
  {
    id: "PB-1066",
    customerName: "Apex Systems Sports Club",
    customerEmail: "events@apexsystems.example.com",
    gymId: "northside",
    gym: "Tagum Pickleball Hub",
    courtId: "whole-gym",
    court: "Whole gym",
    date: "2026-08-27",
    slots: ["4:00 PM", "7:00 PM"],
    bookingType: "whole_gym",
    participantCount: 24,
    amount: 68,
    paymentMethod: "Bank Transfer QR payment",
    paymentStatus: "paid",
    status: "pending",
    createdAt: "2026-08-21T09:18:00Z",
    paymentReceipt: createMockPaymentReceipt({
      venue: "Tagum Pickleball Hub",
      accountName: "Apex Systems Sports Club",
      referenceNumber: "BANK-20260821-1066",
      amount: 68,
      uploadedAt: "2026-08-21 05:18 PM",
    }),
  },
  {
    id: "PB-1042",
    customerName: "Jordan Alcaraz",
    customerEmail: "jordan.alcaraz@example.com",
    gymId: "northside",
    gym: "Tagum Pickleball Hub",
    courtId: "northside-b",
    court: "Court B",
    date: "2026-08-24",
    slots: ["10:00 AM", "2:30 PM"],
    bookingType: "private",
    participantCount: 1,
    amount: 24,
    paymentMethod: "Visa •••• 4821",
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: "2026-08-19T09:14:00Z",
  },
  {
    id: "PB-1043",
    customerName: "Mika Santos",
    customerEmail: "mika.santos@example.com",
    gymId: "central",
    gym: "Mankilam Court Club",
    courtId: "central-2",
    court: "Court 2",
    date: "2026-08-26",
    slots: ["5:00 PM", "8:00 PM"],
    bookingType: "private",
    participantCount: 1,
    amount: 32,
    paymentMethod: "GCash",
    paymentStatus: "paid",
    status: "pending",
    createdAt: "2026-08-20T14:02:00Z",
    paymentReceipt: createMockPaymentReceipt({
      venue: "Mankilam Court Club",
      accountName: "Mika Santos",
      referenceNumber: "GCASH-20260820-1043",
      amount: 32,
      uploadedAt: "2026-08-20 10:18 PM",
    }),
  },
  {
    id: "PB-1019",
    customerName: "Leo Fontanilla",
    customerEmail: "leo.fontanilla@example.com",
    gymId: "riverside",
    gym: "Apokon Rally Courts",
    courtId: "riverside-main",
    court: "Main Court",
    date: "2026-07-05",
    slots: ["7:30 AM"],
    bookingType: "private",
    participantCount: 1,
    amount: 12,
    paymentMethod: "Mastercard •••• 0093",
    paymentStatus: "paid",
    status: "completed",
    createdAt: "2026-07-01T08:30:00Z",
  },
  {
    id: "PB-1051",
    customerName: "Ava Reyes",
    customerEmail: "ava.reyes@example.com",
    gymId: "northside",
    gym: "Tagum Pickleball Hub",
    courtId: "northside-a",
    court: "Court A",
    date: "2026-08-28",
    slots: ["9:30 AM"],
    bookingType: "private",
    participantCount: 1,
    amount: 12,
    paymentMethod: "Visa •••• 7710",
    paymentStatus: "unpaid",
    status: "pending",
    createdAt: "2026-08-21T11:45:00Z",
    paymentReceipt: createMockPaymentReceipt({
      venue: "Tagum Pickleball Hub",
      accountName: "Ava Reyes",
      referenceNumber: "GCASH-20260821-1051",
      amount: 12,
      uploadedAt: "2026-08-21 7:45 PM",
    }),
  },
  {
    id: "PB-1038",
    customerName: "Noah Villareal",
    customerEmail: "noah.villareal@example.com",
    gymId: "central",
    gym: "Mankilam Court Club",
    courtId: "central-1",
    court: "Court 1",
    date: "2026-07-09",
    slots: ["11:00 AM", "2:00 PM"],
    bookingType: "private",
    participantCount: 1,
    amount: 24,
    paymentMethod: "GCash",
    paymentStatus: "refunded",
    status: "cancelled",
    createdAt: "2026-07-04T16:20:00Z",
  },
  {
    id: "PB-1027",
    customerName: "Sofia Cruz",
    customerEmail: "sofia.cruz@example.com",
    gymId: "riverside",
    gym: "Apokon Rally Courts",
    courtId: "riverside-main",
    court: "Main Court",
    date: "2026-06-29",
    slots: ["3:30 PM"],
    bookingType: "private",
    participantCount: 1,
    amount: 12,
    paymentMethod: "Mastercard •••• 5541",
    paymentStatus: "paid",
    status: "completed",
    createdAt: "2026-06-24T10:10:00Z",
  },
]

const TransactionsContext = React.createContext<
  TransactionsContextValue | undefined
>(undefined)

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [transactions, setTransactions] =
    React.useState<Transaction[]>(initialTransactions)

  const addTransaction = React.useCallback((transaction: NewTransaction) => {
    setTransactions((current) => [
      {
        ...transaction,
        createdAt: transaction.createdAt ?? new Date().toISOString(),
      },
      ...current,
    ])
  }, [])

  const setStatus = React.useCallback(
    (id: string, status: TransactionStatus) => {
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                status,
                paymentStatus:
                  status === "confirmed" || status === "completed"
                    ? transaction.paymentReceipt
                      ? "paid"
                      : transaction.paymentStatus
                    : transaction.paymentStatus,
              }
            : transaction
        )
      )
    },
    []
  )

  const refund = React.useCallback((id: string) => {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id
          ? { ...transaction, status: "cancelled", paymentStatus: "refunded" }
          : transaction
      )
    )
  }, [])

  const value = React.useMemo(
    () => ({ transactions, addTransaction, setStatus, refund }),
    [transactions, addTransaction, setStatus, refund]
  )

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = React.useContext(TransactionsContext)

  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    )
  }

  return context
}
