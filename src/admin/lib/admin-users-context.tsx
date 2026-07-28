/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type PlayerStatus = "active" | "suspended"

export type Player = {
  id: string
  name: string
  email: string
  phone?: string
  joinedAt: string
  status: PlayerStatus
}

type AdminUsersContextValue = {
  players: Player[]
  setPlayerStatus: (id: string, status: PlayerStatus) => void
}

const initialPlayers: Player[] = [
  {
    id: "USR-1001",
    name: "Jordan Alcaraz",
    email: "jordan.alcaraz@example.com",
    phone: "(555) 210-4471",
    joinedAt: "2026-02-14",
    status: "active",
  },
  {
    id: "USR-1002",
    name: "Mika Santos",
    email: "mika.santos@example.com",
    phone: "(555) 210-9821",
    joinedAt: "2026-03-02",
    status: "active",
  },
  {
    id: "USR-1003",
    name: "Leo Fontanilla",
    email: "leo.fontanilla@example.com",
    joinedAt: "2026-01-27",
    status: "active",
  },
  {
    id: "USR-1004",
    name: "Ava Reyes",
    email: "ava.reyes@example.com",
    phone: "(555) 210-3390",
    joinedAt: "2026-04-11",
    status: "active",
  },
  {
    id: "USR-1005",
    name: "Noah Villareal",
    email: "noah.villareal@example.com",
    joinedAt: "2026-03-19",
    status: "suspended",
  },
  {
    id: "USR-1006",
    name: "Sofia Cruz",
    email: "sofia.cruz@example.com",
    phone: "(555) 210-6602",
    joinedAt: "2026-02-28",
    status: "active",
  },
  {
    id: "USR-1007",
    name: "Ethan Bautista",
    email: "ethan.bautista@example.com",
    joinedAt: "2026-05-06",
    status: "active",
  },
]

const AdminUsersContext = React.createContext<
  AdminUsersContextValue | undefined
>(undefined)

export function AdminUsersProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = React.useState<Player[]>(initialPlayers)

  const setPlayerStatus = React.useCallback(
    (id: string, status: PlayerStatus) => {
      setPlayers((current) =>
        current.map((player) =>
          player.id === id ? { ...player, status } : player
        )
      )
    },
    []
  )

  const value = React.useMemo(
    () => ({ players, setPlayerStatus }),
    [players, setPlayerStatus]
  )

  return (
    <AdminUsersContext.Provider value={value}>
      {children}
    </AdminUsersContext.Provider>
  )
}

export function useAdminUsers() {
  const context = React.useContext(AdminUsersContext)

  if (context === undefined) {
    throw new Error("useAdminUsers must be used within an AdminUsersProvider")
  }

  return context
}
