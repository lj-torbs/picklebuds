/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type AdminUser = {
  name: string
  email: string
}

type AdminLoginInput = {
  email: string
  password: string
}

type AdminAuthContextValue = {
  admin: AdminUser | null
  login: (input: AdminLoginInput) => void
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
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return isAdminUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

function deriveNameFromEmail(email: string) {
  const [local] = email.split("@")
  if (!local) {
    return "Admin"
  }

  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ")
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = React.useState<AdminUser | null>(readStoredAdmin)

  const persistAdmin = React.useCallback((nextAdmin: AdminUser | null) => {
    setAdmin(nextAdmin)
    if (nextAdmin) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAdmin))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = React.useCallback(
    ({ email }: AdminLoginInput) => {
      persistAdmin({ name: deriveNameFromEmail(email), email })
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
