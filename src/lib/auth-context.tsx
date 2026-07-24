/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type AuthUser = {
  name: string
  email: string
}

type LoginInput = {
  email: string
  password: string
}

type SignupInput = {
  name: string
  email: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (input: LoginInput) => void
  signup: (input: SignupInput) => void
  logout: () => void
}

const STORAGE_KEY = "pb-auth-user"

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AuthUser).name === "string" &&
    typeof (value as AuthUser).email === "string"
  )
}

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return isAuthUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

function deriveNameFromEmail(email: string) {
  const [local] = email.split("@")
  if (!local) {
    return "Player"
  }

  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ")
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(readStoredUser)

  const persistUser = React.useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = React.useCallback(
    ({ email }: LoginInput) => {
      persistUser({ name: deriveNameFromEmail(email), email })
    },
    [persistUser]
  )

  const signup = React.useCallback(
    ({ name, email }: SignupInput) => {
      persistUser({ name, email })
    },
    [persistUser]
  )

  const logout = React.useCallback(() => {
    persistUser(null)
  }, [persistUser])

  const value = React.useMemo(
    () => ({ user, login, signup, logout }),
    [user, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
