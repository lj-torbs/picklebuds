/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type OwnerStatus = "active" | "suspended"
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
}

type AdminOwnersContextValue = {
  owners: OwnerRecord[]
  setOwnerStatus: (
    id: string,
    status: OwnerStatus,
    reason?: OwnerSuspensionReason
  ) => void
  setSystemPaymentStatus: (id: string, status: SystemPaymentStatus) => void
}

const initialOwners: OwnerRecord[] = [
  {
    id: "owner-1",
    name: "Priya Nair",
    email: "priya@northsidepb.com",
    phone: "(555) 210-4471",
    joinedAt: "2026-01-12",
    status: "active",
    systemPaymentStatus: "unpaid",
  },
  {
    id: "owner-2",
    name: "Marcus Diaz",
    email: "marcus@riversidesports.com",
    phone: "(555) 210-9821",
    joinedAt: "2026-02-03",
    status: "active",
    systemPaymentStatus: "paid",
  },
  {
    id: "owner-3",
    name: "Angela Ramos",
    email: "angela@tagumpickle.co",
    phone: "(555) 210-3390",
    joinedAt: "2026-03-18",
    status: "suspended",
    systemPaymentStatus: "unpaid",
    suspensionReason: "system_payment_due",
  },
]

const AdminOwnersContext = React.createContext<
  AdminOwnersContextValue | undefined
>(undefined)

export function AdminOwnersProvider({ children }: { children: React.ReactNode }) {
  const [owners, setOwners] = React.useState<OwnerRecord[]>(initialOwners)

  const setOwnerStatus = React.useCallback(
    (id: string, status: OwnerStatus, reason?: OwnerSuspensionReason) => {
      setOwners((current) =>
        current.map((owner) =>
          owner.id === id
            ? {
                ...owner,
                status,
                suspensionReason: status === "suspended" ? reason : undefined,
              }
            : owner
        )
      )
    },
    []
  )

  const setSystemPaymentStatus = React.useCallback(
    (id: string, status: SystemPaymentStatus) => {
      setOwners((current) =>
        current.map((owner) =>
          owner.id === id
            ? {
                ...owner,
                systemPaymentStatus: status,
                status:
                  owner.suspensionReason === "system_payment_due" &&
                  status === "paid"
                    ? "active"
                    : owner.status,
                suspensionReason:
                  owner.suspensionReason === "system_payment_due" &&
                  status === "paid"
                    ? undefined
                    : owner.suspensionReason,
              }
            : owner
        )
      )
    },
    []
  )

  const value = React.useMemo(
    () => ({ owners, setOwnerStatus, setSystemPaymentStatus }),
    [owners, setOwnerStatus, setSystemPaymentStatus]
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
