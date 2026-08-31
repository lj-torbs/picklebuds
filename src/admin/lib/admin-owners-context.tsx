/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { useAdminAuth } from "@/admin/lib/admin-auth-context"
import {
  getAdminOwnerDetail,
  getAdminOwners,
  lockAdminOwner,
  unlockAdminOwner,
  updateAdminOwnerPaymentStatus,
  updateAdminOwnerStatus,
  type AdminApiOwnerDetail,
  type AdminApiOwnerSummary,
  type AdminApiOwnerTransaction,
} from "@/lib/admin-api"

export type OwnerStatus = "active" | "suspended" | "inactive"
export type SystemPaymentStatus = "paid" | "unpaid"
export type OwnerSuspensionReason = "system_payment_due" | "manual_review"

export type OwnerRecord = {
  id: string
  name: string
  email: string
  phone?: string
  joinedAt: string
  status: OwnerStatus
  systemPaymentStatus: SystemPaymentStatus
  suspensionReason?: OwnerSuspensionReason
  totalGyms: number
  totalCourts: number
  grossRevenue: number
  systemShare: number
  ownerProfit: number
}

export type OwnerTransactionRecord = {
  id: string
  bookingId: string
  customerName: string
  gymName: string
  courtName: string
  bookingType: "private" | "open_play" | "whole_gym"
  bookingDate: string
  amount: number
  paymentStatus: "paid" | "unpaid" | "refunded"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
}

export type OwnerDetailRecord = {
  owner: OwnerRecord
  transactions: OwnerTransactionRecord[]
}

type AdminOwnersContextValue = {
  owners: OwnerRecord[]
  isLoading: boolean
  error: string | null
  refreshOwners: (filters?: { dateFrom?: string; dateTo?: string }) => Promise<void>
  getOwnerDetail: (
    id: string,
    filters?: { dateFrom?: string; dateTo?: string }
  ) => Promise<OwnerDetailRecord>
  setOwnerStatus: (
    id: string,
    status: "active" | "suspended",
    reason?: OwnerSuspensionReason
  ) => Promise<void>
  setSystemPaymentStatus: (id: string, status: SystemPaymentStatus) => Promise<void>
  lockOwnerUntilPaid: (id: string) => Promise<void>
  unlockOwner: (id: string) => Promise<void>
}

const AdminOwnersContext = React.createContext<
  AdminOwnersContextValue | undefined
>(undefined)

function mapOwner(owner: AdminApiOwnerSummary): OwnerRecord {
  return {
    id: owner.id,
    name: owner.name,
    email: owner.email,
    phone: owner.phone ?? undefined,
    joinedAt: owner.joined_at ?? "",
    status: owner.status,
    systemPaymentStatus: owner.system_payment_status,
    suspensionReason: owner.suspension_reason ?? undefined,
    totalGyms: owner.total_gyms,
    totalCourts: owner.total_courts,
    grossRevenue: owner.gross_revenue,
    systemShare: owner.system_share,
    ownerProfit: owner.owner_total_profit,
  }
}

function mapTransaction(
  transaction: AdminApiOwnerTransaction
): OwnerTransactionRecord {
  return {
    id: transaction.id,
    bookingId: transaction.booking_id,
    customerName: transaction.customer_name,
    gymName: transaction.gym_name,
    courtName: transaction.court_name,
    bookingType: transaction.booking_type,
    bookingDate: transaction.booking_date,
    amount: transaction.amount,
    paymentStatus: transaction.payment_status,
    status: transaction.status,
    createdAt: transaction.created_at,
  }
}

function mapOwnerDetail(detail: AdminApiOwnerDetail): OwnerDetailRecord {
  return {
    owner: mapOwner(detail.owner),
    transactions: detail.transactions.map(mapTransaction),
  }
}

export function AdminOwnersProvider({ children }: { children: React.ReactNode }) {
  const { admin } = useAdminAuth()
  const [owners, setOwners] = React.useState<OwnerRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const refreshOwners = React.useCallback(
    async (filters?: { dateFrom?: string; dateTo?: string }) => {
      if (!admin?.token) {
        setOwners([])
        setError(null)
        return
      }

      setIsLoading(true)
      try {
        const response = await getAdminOwners({
          token: admin.token,
          dateFrom: filters?.dateFrom,
          dateTo: filters?.dateTo,
        })
        setOwners(response.items.map(mapOwner))
        setError(null)
      } catch (nextError) {
        setError(
          nextError instanceof Error ? nextError.message : "Unable to load owners."
        )
      } finally {
        setIsLoading(false)
      }
    },
    [admin]
  )

  const getOwnerDetail = React.useCallback(
    async (id: string, filters?: { dateFrom?: string; dateTo?: string }) => {
      if (!admin?.token) {
        throw new Error("Admin session is required.")
      }

      const detail = await getAdminOwnerDetail({
        token: admin.token,
        ownerId: id,
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
      })

      return mapOwnerDetail(detail)
    },
    [admin]
  )

  const patchOwner = React.useCallback(
    (
      id: string,
      nextOwner: Partial<
        Pick<OwnerRecord, "status" | "systemPaymentStatus" | "suspensionReason">
      >
    ) => {
      setOwners((current) =>
        current.map((owner) => (owner.id === id ? { ...owner, ...nextOwner } : owner))
      )
    },
    []
  )

  const setOwnerStatus = React.useCallback(
    async (id: string, status: "active" | "suspended", reason?: OwnerSuspensionReason) => {
      if (!admin?.token) {
        throw new Error("Admin session is required.")
      }

      const response = await updateAdminOwnerStatus({
        token: admin.token,
        ownerId: id,
        status,
        reason,
      })

      patchOwner(id, {
        status: response.status,
        systemPaymentStatus: response.system_payment_status,
        suspensionReason: response.suspension_reason ?? undefined,
      })
    },
    [admin, patchOwner]
  )

  const setSystemPaymentStatus = React.useCallback(
    async (id: string, status: SystemPaymentStatus) => {
      if (!admin?.token) {
        throw new Error("Admin session is required.")
      }

      const response = await updateAdminOwnerPaymentStatus({
        token: admin.token,
        ownerId: id,
        status,
      })

      patchOwner(id, {
        status: response.status,
        systemPaymentStatus: response.system_payment_status,
        suspensionReason: response.suspension_reason ?? undefined,
      })
    },
    [admin, patchOwner]
  )

  const lockOwnerUntilPaid = React.useCallback(
    async (id: string) => {
      if (!admin?.token) {
        throw new Error("Admin session is required.")
      }

      const response = await lockAdminOwner({ token: admin.token, ownerId: id })
      patchOwner(id, {
        status: response.status,
        systemPaymentStatus: response.system_payment_status,
        suspensionReason: response.suspension_reason ?? undefined,
      })
    },
    [admin, patchOwner]
  )

  const unlockOwner = React.useCallback(
    async (id: string) => {
      if (!admin?.token) {
        throw new Error("Admin session is required.")
      }

      const response = await unlockAdminOwner({ token: admin.token, ownerId: id })
      patchOwner(id, {
        status: response.status,
        systemPaymentStatus: response.system_payment_status,
        suspensionReason: response.suspension_reason ?? undefined,
      })
    },
    [admin, patchOwner]
  )

  const value = React.useMemo(
    () => ({
      owners,
      isLoading,
      error,
      refreshOwners,
      getOwnerDetail,
      setOwnerStatus,
      setSystemPaymentStatus,
      lockOwnerUntilPaid,
      unlockOwner,
    }),
    [
      owners,
      isLoading,
      error,
      refreshOwners,
      getOwnerDetail,
      setOwnerStatus,
      setSystemPaymentStatus,
      lockOwnerUntilPaid,
      unlockOwner,
    ]
  )

  return (
    <AdminOwnersContext.Provider value={value}>
      {children}
    </AdminOwnersContext.Provider>
  )
}

export function useAdminOwners() {
  const context = React.useContext(AdminOwnersContext)

  if (context === undefined) {
    throw new Error("useAdminOwners must be used within an AdminOwnersProvider")
  }

  return context
}
