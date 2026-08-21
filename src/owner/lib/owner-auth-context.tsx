/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { useAdminOwners } from "@/admin/lib/admin-owners-context"

type OwnerUser = {
  id: string
  name: string
  email: string
}

type OwnerLoginInput = {
  email: string
  password: string
}

type OwnerLoginResult =
  | { ok: true; owner: OwnerUser }
  | { ok: false; reason: "payment_due" | "suspended" }

type OwnerAuthContextValue = {
  owner: OwnerUser | null
  login: (input: OwnerLoginInput) => OwnerLoginResult
  logout: () => void
}

const STORAGE_KEY = "pb-owner-auth-user"

const demoOwnerAccounts: OwnerUser[] = [
  { id: "owner-1", name: "Priya Nair", email: "priya@northsidepb.com" },
  { id: "owner-2", name: "Marcus Diaz", email: "marcus@riversidesports.com" },
]

const OwnerAuthContext = React.createContext<OwnerAuthContextValue | undefined>(
  undefined
)

function isOwnerUser(value: unknown): value is OwnerUser {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as OwnerUser).id === "string" &&
    typeof (value as OwnerUser).name === "string" &&
    typeof (value as OwnerUser).email === "string"
  )
}

function readStoredOwner(): OwnerUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return isOwnerUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function OwnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { owners } = useAdminOwners()
  const [owner, setOwner] = React.useState<OwnerUser | null>(readStoredOwner)

  const persistOwner = React.useCallback((nextOwner: OwnerUser | null) => {
    setOwner(nextOwner)
    if (nextOwner) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOwner))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = React.useCallback(
    ({ email }: OwnerLoginInput): OwnerLoginResult => {
      const matchedRecord =
        owners.find((record) => record.email.toLowerCase() === email.toLowerCase()) ??
        null
      const matchedOwner =
        matchedRecord ??
        demoOwnerAccounts.find(
          (account) => account.email.toLowerCase() === email.toLowerCase()
        ) ??
        { ...demoOwnerAccounts[0], email }

      if (matchedRecord?.status === "suspended") {
        return {
          ok: false,
          reason:
            matchedRecord.suspensionReason === "system_payment_due"
              ? "payment_due"
              : "suspended",
        }
      }

      const resolvedOwner = {
        id: matchedOwner.id,
        name: matchedOwner.name,
        email: matchedOwner.email,
      }

      persistOwner(resolvedOwner)
      return { ok: true, owner: resolvedOwner }
    },
    [owners, persistOwner]
  )

  const logout = React.useCallback(() => {
    persistOwner(null)
  }, [persistOwner])

  const value = React.useMemo(
    () => ({ owner, login, logout }),
    [owner, login, logout]
  )

  return (
    <OwnerAuthContext.Provider value={value}>
      {children}
    </OwnerAuthContext.Provider>
  )
}

export function useOwnerAuth() {
  const context = React.useContext(OwnerAuthContext)

  if (context === undefined) {
    throw new Error("useOwnerAuth must be used within an OwnerAuthProvider")
  }

  return context
}
