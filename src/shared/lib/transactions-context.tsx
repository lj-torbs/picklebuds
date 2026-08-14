/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import type { PaymentReceipt } from "@/shared/lib/payment-receipt"

export type TransactionStatus =
  "confirmed" | "pending" | "completed" | "cancelled"
export type PaymentStatus = "paid" | "unpaid" | "refunded"

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
    id: "PB-1042",
    customerName: "Jordan Alcaraz",
    customerEmail: "jordan.alcaraz@example.com",
    gymId: "northside",
    gym: "Tagum Pickleball Hub",
    courtId: "northside-b",
    court: "Court B",
    date: "2026-07-12",
    slots: ["10:00 AM", "2:30 PM"],
    amount: 24,
    paymentMethod: "Visa •••• 4821",
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: "2026-07-08T09:14:00Z",
  },
  {
    id: "PB-1043",
    customerName: "Mika Santos",
    customerEmail: "mika.santos@example.com",
    gymId: "central",
    gym: "Mankilam Court Club",
    courtId: "central-2",
    court: "Court 2",
    date: "2026-07-15",
    slots: ["5:00 PM", "8:00 PM"],
    amount: 32,
    paymentMethod: "GCash",
    paymentStatus: "paid",
    status: "pending",
    createdAt: "2026-07-10T14:02:00Z",
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
    date: "2026-07-20",
    slots: ["9:30 AM"],
    amount: 12,
    paymentMethod: "Visa •••• 7710",
    paymentStatus: "unpaid",
    status: "pending",
    createdAt: "2026-07-16T11:45:00Z",
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
          transaction.id === id ? { ...transaction, status } : transaction
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
