/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { useAdminOwners } from "@/admin/lib/admin-owners-context"
import { AuthApiError, loginWithApi } from "@/lib/auth-api"
import { persistStorageItem, readStorageItem } from "@/lib/auth-storage"

type OwnerUser = {
  id: string
  name: string
  email: string
  token?: string
}

type OwnerLoginInput = {
  email: string
  password: string
}

type OwnerLoginResult =
  | { ok: true; owner: OwnerUser }
  | {
      ok: false
      reason:
        | "payment_due"
        | "suspended"
        | "invalid_credentials"
        | "rate_limited"
      message?: string
    }

type OwnerAuthContextValue = {
  owner: OwnerUser | null
  login: (input: OwnerLoginInput) => Promise<OwnerLoginResult>
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
  return readStorageItem(STORAGE_KEY, isOwnerUser)
}

export function OwnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { owners } = useAdminOwners()
  const [owner, setOwner] = React.useState<OwnerUser | null>(readStoredOwner)

  const persistOwner = React.useCallback((nextOwner: OwnerUser | null) => {
    setOwner(nextOwner)
    persistStorageItem(STORAGE_KEY, nextOwner)
  }, [])

  const login = React.useCallback(
    async ({ email, password }: OwnerLoginInput): Promise<OwnerLoginResult> => {
      try {
        const session = await loginWithApi(email, password, "owner")
        const matchedRecord =
          owners.find(
            (record) =>
              record.email.toLowerCase() === session.user.email.toLowerCase()
          ) ??
          demoOwnerAccounts.find(
            (account) =>
              account.email.toLowerCase() === session.user.email.toLowerCase()
          ) ??
          null

        const resolvedOwner = {
          id: matchedRecord?.id ?? session.user.public_id,
          name: session.user.full_name,
          email: session.user.email,
          token: session.access_token,
        }

        persistOwner(resolvedOwner)
        return { ok: true, owner: resolvedOwner }
      } catch (error) {
        if (error instanceof AuthApiError) {
          if (error.status === 429) {
            return { ok: false, reason: "rate_limited", message: error.message }
          }
          if (error.message.includes("locked until system payment")) {
            return { ok: false, reason: "payment_due" }
          }
          if (error.message.includes("suspended")) {
            return { ok: false, reason: "suspended" }
          }
        }
        return { ok: false, reason: "invalid_credentials" }
      }
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
