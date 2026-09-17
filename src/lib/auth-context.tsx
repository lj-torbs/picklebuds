/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { loginWithApi, signupWithApi } from "@/lib/auth-api"
import { persistStorageItem, readStorageItem } from "@/lib/auth-storage"

type AuthUser = {
  id?: number
  publicId?: string
  name: string
  email: string
  token?: string
  phone?: string
  location?: string
  avatarUrl?: string
  openPlayAnnouncementsEnabled?: boolean
  joinedAt: string
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

type ProfileUpdate = Partial<
  Pick<
    AuthUser,
    "name" | "phone" | "location" | "avatarUrl" | "openPlayAnnouncementsEnabled"
  >
>

type AuthContextValue = {
  user: AuthUser | null
  login: (input: LoginInput) => Promise<void>
  signup: (input: SignupInput) => Promise<void>
  logout: () => void
  updateProfile: (update: ProfileUpdate) => void
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
  return readStorageItem(STORAGE_KEY, isAuthUser)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(readStoredUser)

  const persistUser = React.useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser)
    persistStorageItem(STORAGE_KEY, nextUser)
  }, [])

  const login = React.useCallback(
    async ({ email, password }: LoginInput) => {
      const session = await loginWithApi(email, password, "player")
      const existing = readStoredUser()
      persistUser({
        id: session.user.id,
        publicId: session.user.public_id,
        name: session.user.full_name,
        email: session.user.email,
        token: session.access_token,
        phone:
          session.user.phone ??
          (existing?.email === session.user.email ? existing.phone : undefined),
        location:
          session.user.location ??
          (existing?.email === session.user.email ? existing.location : undefined),
        avatarUrl:
          session.user.avatar_url ??
          (existing?.email === session.user.email ? existing.avatarUrl : undefined),
        openPlayAnnouncementsEnabled:
          session.user.open_play_announcements_enabled ??
          (existing?.email === session.user.email
            ? existing.openPlayAnnouncementsEnabled
            : false),
        joinedAt:
          session.user.joined_at ??
          (existing?.email === session.user.email
            ? existing.joinedAt
            : new Date().toISOString()),
      })
    },
    [persistUser]
  )

  const signup = React.useCallback(
    async ({ name, email, password }: SignupInput) => {
      const session = await signupWithApi(name, email, password)
      persistUser({
        id: session.user.id,
        publicId: session.user.public_id,
        name: session.user.full_name,
        email: session.user.email,
        token: session.access_token,
        phone: session.user.phone ?? undefined,
        location: session.user.location ?? undefined,
        avatarUrl: session.user.avatar_url ?? undefined,
        openPlayAnnouncementsEnabled:
          session.user.open_play_announcements_enabled ?? false,
        joinedAt: session.user.joined_at ?? new Date().toISOString(),
      })
    },
    [persistUser]
  )

  const logout = React.useCallback(() => {
    persistUser(null)
  }, [persistUser])

  const updateProfile = React.useCallback((update: ProfileUpdate) => {
    setUser((current) => {
      if (!current) {
        return current
      }

      const nextUser = { ...current, ...update }
      persistStorageItem(STORAGE_KEY, nextUser)
      return nextUser
    })
  }, [])

  const value = React.useMemo(
    () => ({ user, login, signup, logout, updateProfile }),
    [user, login, signup, logout, updateProfile]
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
