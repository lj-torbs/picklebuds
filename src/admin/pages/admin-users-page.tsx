import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { UserDetailSheet } from "@/admin/components/users/user-detail-sheet"
import { UserStatusBadge } from "@/admin/components/users/user-status-badge"
import type { Player } from "@/admin/lib/admin-users-context"
import { useAdminUsers } from "@/admin/lib/admin-users-context"
import { useTransactions } from "@/shared/lib/transactions-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

function playerMatchesQuery(player: Player, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    player.name.toLowerCase().includes(normalizedQuery) ||
    player.email.toLowerCase().includes(normalizedQuery)
  )
}

export function AdminUsersPage() {
  const { players, setPlayerStatus } = useAdminUsers()
  const { transactions } = useTransactions()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const playerStats = useMemo(() => {
    const stats = new Map<string, { totalBookings: number; totalSpent: number }>()

    for (const transaction of transactions) {
      const email = transaction.customerEmail.toLowerCase()
      const current = stats.get(email) ?? { totalBookings: 0, totalSpent: 0 }
      current.totalBookings += 1
      if (transaction.paymentStatus === "paid") {
        current.totalSpent += transaction.amount
      }
      stats.set(email, current)
    }

    return stats
  }, [transactions])

  const filteredPlayers = useMemo(
    () => players.filter((player) => playerMatchesQuery(player, searchQuery)),
    [players, searchQuery]
  )

  const selectedPlayer =
    players.find((player) => player.id === selectedPlayerId) ?? null

  const selectedPlayerTransactions = selectedPlayer
    ? transactions.filter(
        (transaction) =>
          transaction.customerEmail.toLowerCase() ===
          selectedPlayer.email.toLowerCase()
      )
    : []

  function handleToggleStatus(id: string) {
    const player = players.find((current) => current.id === id)
    if (!player) {
      return
    }

    const nextStatus = player.status === "active" ? "suspended" : "active"
    setPlayerStatus(id, nextStatus)
    toast.add({
      title: nextStatus === "suspended" ? "Player suspended" : "Player reactivated",
      description: `${player.name} is now ${nextStatus}.`,
      type: "success",
    })
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Players</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Manage users
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Search players, review their booking history, and manage access.
          </p>
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-8"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          No players match your search.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Bookings</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPlayers.map((player) => {
                const stats = playerStats.get(player.email.toLowerCase()) ?? {
                  totalBookings: 0,
                  totalSpent: 0,
                }

                return (
                  <tr key={player.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {player.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {player.joinedAt}
                    </td>
                    <td className="px-4 py-3">{stats.totalBookings}</td>
                    <td className="px-4 py-3 font-medium">
                      ${stats.totalSpent}
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={player.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlayerId(player.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <UserDetailSheet
        player={selectedPlayer}
        transactions={selectedPlayerTransactions}
        open={selectedPlayer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPlayerId(null)
          }
        }}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  )
}
