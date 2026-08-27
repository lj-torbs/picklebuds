/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { loginWithApi } from "@/lib/auth-api"
import { persistStorageItem, readStorageItem } from "@/lib/auth-storage"

type AdminUser = {
  id?: number
  publicId?: string
  name: string
  email: string
  token?: string
}

type AdminLoginInput = {
  email: string
  password: string
}

type AdminAuthContextValue = {
  admin: AdminUser | null
  login: (input: AdminLoginInput) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = "pb-admin-auth-user"

const AdminAuthContext = React.createContext<AdminAuthContextValue | undefined>(
  undefined
)

function isAdminUser(value: unknown): value is AdminUser {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AdminUser).name === "string" &&
    typeof (value as AdminUser).email === "string"
  )
}

function readStoredAdmin(): AdminUser | null {
  return readStorageItem(STORAGE_KEY, isAdminUser)
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = React.useState<AdminUser | null>(readStoredAdmin)

  const persistAdmin = React.useCallback((nextAdmin: AdminUser | null) => {
    setAdmin(nextAdmin)
    persistStorageItem(STORAGE_KEY, nextAdmin)
  }, [])

  const login = React.useCallback(
    async ({ email, password }: AdminLoginInput) => {
      const session = await loginWithApi(email, password, "admin")
      persistAdmin({
        id: session.user.id,
        publicId: session.user.public_id,
        name: session.user.full_name,
        email: session.user.email,
        token: session.access_token,
      })
    },
    [persistAdmin]
  )

  const logout = React.useCallback(() => {
    persistAdmin(null)
  }, [persistAdmin])

  const value = React.useMemo(
    () => ({ admin, login, logout }),
    [admin, login, logout]
  )

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = React.useContext(AdminAuthContext)

  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }

  return context
}
