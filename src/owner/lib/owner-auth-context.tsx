/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type OwnerUser = {
  id: string
  name: string
  email: string
}

type OwnerLoginInput = {
  email: string
  password: string
}

type OwnerAuthContextValue = {
  owner: OwnerUser | null
  login: (input: OwnerLoginInput) => void
  logout: () => void
}

const STORAGE_KEY = "pb-owner-auth-user"

// Demo mapping only: this prototype has no backend, so login is matched
// against a fixed list of demo owner accounts. Any other email still logs
// in (consistent with the rest of the app's mock auth) and defaults to the
// first demo owner so the "My gyms" flow always has data to show.
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

function resolveOwner(email: string): OwnerUser {
  const match = demoOwnerAccounts.find(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  )
  return match ?? { ...demoOwnerAccounts[0], email }
}

export function OwnerAuthProvider({ children }: { children: React.ReactNode }) {
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
    ({ email }: OwnerLoginInput) => {
      persistOwner(resolveOwner(email))
    },
    [persistOwner]
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
