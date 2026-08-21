import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { OwnerDetailSheet } from "@/admin/components/owners/owner-detail-sheet"
import { OwnerStatusBadge } from "@/admin/components/owners/owner-status-badge"
import type {
  OwnerRecord,
  SystemPaymentStatus,
} from "@/admin/lib/admin-owners-context"
import { useAdminOwners } from "@/admin/lib/admin-owners-context"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useGyms } from "@/shared/lib/gyms-context"
import { useTransactions } from "@/shared/lib/transactions-context"

const SYSTEM_SHARE_RATE = 0.12
const quickFilters = ["all", "paid", "unpaid", "suspended"] as const
type QuickFilter = (typeof quickFilters)[number]

function ownerMatchesQuery(owner: OwnerRecord, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    owner.name.toLowerCase().includes(normalizedQuery) ||
    owner.email.toLowerCase().includes(normalizedQuery)
  )
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

function PaymentStatusBadge({
  status,
}: {
  status: SystemPaymentStatus
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium capitalize",
        status === "paid"
          ? "bg-primary/15 text-primary"
          : "bg-amber-500/15 text-amber-700"
      )}
    >
      {status === "paid" ? "Paid to system" : "Unpaid to system"}
    </span>
  )
}

export function AdminOwnersPage() {
  const { owners, setOwnerStatus, setSystemPaymentStatus } = useAdminOwners()
  const { gyms } = useGyms()
  const { transactions } = useTransactions()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null)
  const [systemPaymentFilter, setSystemPaymentFilter] = useState<
    SystemPaymentStatus | "all"
  >("all")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const ownerStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        totalGyms: number
        totalCourts: number
        grossRevenue: number
        systemShare: number
        ownerProfit: number
      }
    >()

    for (const owner of owners) {
      stats.set(owner.id, {
        totalGyms: 0,
        totalCourts: 0,
        grossRevenue: 0,
        systemShare: 0,
        ownerProfit: 0,
      })
    }

    for (const gym of gyms) {
      const current = stats.get(gym.ownerId)
      if (!current) {
        continue
      }
      current.totalGyms += 1
      current.totalCourts += gym.courts.length
    }

    for (const transaction of transactions) {
      if (
        transaction.paymentStatus !== "paid" ||
        (dateFrom.length > 0 && transaction.date < dateFrom) ||
        (dateTo.length > 0 && transaction.date > dateTo)
      ) {
        continue
      }

      const gym = gyms.find((currentGym) => currentGym.id === transaction.gymId)
      if (!gym) {
        continue
      }

      const current = stats.get(gym.ownerId)
      if (!current) {
        continue
      }

      current.grossRevenue += transaction.amount
    }

    for (const current of stats.values()) {
      current.systemShare = current.grossRevenue * SYSTEM_SHARE_RATE
      current.ownerProfit = current.grossRevenue - current.systemShare
    }

    return stats
  }, [owners, gyms, transactions, dateFrom, dateTo])

  const filteredOwners = useMemo(
    () =>
      owners.filter(
        (owner) =>
          ownerMatchesQuery(owner, searchQuery) &&
          (systemPaymentFilter === "all" ||
            owner.systemPaymentStatus === systemPaymentFilter) &&
          (quickFilter === "all" ||
            (quickFilter === "suspended" && owner.status === "suspended") ||
            (quickFilter === "paid" && owner.systemPaymentStatus === "paid") ||
            (quickFilter === "unpaid" &&
              owner.systemPaymentStatus === "unpaid"))
      ),
    [owners, searchQuery, systemPaymentFilter, quickFilter]
  )

  const selectedOwner =
    owners.find((owner) => owner.id === selectedOwnerId) ?? null

  const selectedOwnerTransactions = selectedOwner
    ? transactions.filter((transaction) => {
        const gym = gyms.find((currentGym) => currentGym.id === transaction.gymId)

        return (
          gym?.ownerId === selectedOwner.id &&
          (dateFrom.length === 0 || transaction.date >= dateFrom) &&
          (dateTo.length === 0 || transaction.date <= dateTo)
        )
      })
    : []

  function handleToggleStatus(id: string) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    const nextStatus = owner.status === "active" ? "suspended" : "active"
    setOwnerStatus(id, nextStatus, nextStatus === "suspended" ? "manual_review" : undefined)
    toast.add({
      title: nextStatus === "suspended" ? "Owner suspended" : "Owner reactivated",
      description: `${owner.name} is now ${nextStatus}.`,
      type: "success",
    })
  }

  function handleSystemPaymentStatus(id: string, status: SystemPaymentStatus) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    setSystemPaymentStatus(id, status)
    toast.add({
      title:
        status === "paid" ? "System share marked paid" : "System share marked unpaid",
      description: `${owner.name} is now ${status} for admin settlement.`,
      type: "success",
    })
  }

  function handleLockUntilPaid(id: string) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    setOwnerStatus(id, "suspended", "system_payment_due")
    toast.add({
      title: "Owner locked",
      description: `${owner.name} must pay the system share first before access is restored.`,
      type: "success",
    })
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Owners</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Manage owners
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Track owner settlements, filter revenue by date range, and lock access when the system share has not been paid yet.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.5fr)_200px_280px]">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="h-9 pl-8"
              placeholder="Search by owner name or email"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <select
            value={systemPaymentFilter}
            onChange={(event) =>
              setSystemPaymentFilter(
                event.target.value as SystemPaymentStatus | "all"
              )
            }
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Filter by owner payment status"
          >
            <option value="all">All owner payment status</option>
            <option value="paid">Paid to system</option>
            <option value="unpaid">Unpaid to system</option>
          </select>

          <div className="rounded-md border bg-background p-1">
            <DateRangePicker
              id="admin-owners-date-range"
              from={dateFrom}
              to={dateTo}
              onChange={({ from, to }) => {
                setDateFrom(from)
                setDateTo(to)
              }}
              placeholder="Report by date range"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          {quickFilters.map((filter) => (
            <Button
              key={filter}
              type="button"
              size="sm"
              variant={quickFilter === filter ? "default" : "ghost"}
              className={cn(
                "h-8 px-3 capitalize",
                quickFilter === filter && "pointer-events-none"
              )}
              onClick={() => setQuickFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {filteredOwners.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          No owners match your filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground uppercase">
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Gyms</th>
                <th className="px-4 py-3 font-medium">Courts</th>
                <th className="px-4 py-3 font-medium">Owner total profit</th>
                <th className="px-4 py-3 font-medium">System share</th>
                <th className="px-4 py-3 font-medium">Payment status</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOwners.map((owner) => {
                const stats = ownerStats.get(owner.id) ?? {
                  totalGyms: 0,
                  totalCourts: 0,
                  grossRevenue: 0,
                  systemShare: 0,
                  ownerProfit: 0,
                }

                return (
                  <tr key={owner.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{owner.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {owner.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {owner.joinedAt}
                    </td>
                    <td className="px-4 py-3">{stats.totalGyms}</td>
                    <td className="px-4 py-3">{stats.totalCourts}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(stats.ownerProfit)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(stats.systemShare)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={owner.systemPaymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="grid gap-1">
                        <OwnerStatusBadge status={owner.status} />
                        {owner.suspensionReason === "system_payment_due" ? (
                          <span className="text-xs text-destructive">
                            Need to pay first
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {owner.systemPaymentStatus === "unpaid" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSystemPaymentStatus(owner.id, "paid")}
                          >
                            Mark paid
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSystemPaymentStatus(owner.id, "unpaid")}
                          >
                            Mark unpaid
                          </Button>
                        )}
                        {owner.systemPaymentStatus === "unpaid" &&
                        owner.status === "active" ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleLockUntilPaid(owner.id)}
                          >
                            Lock
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOwnerId(owner.id)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <OwnerDetailSheet
        owner={selectedOwner}
        transactions={selectedOwnerTransactions}
        open={selectedOwner !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOwnerId(null)
          }
        }}
        onToggleStatus={handleToggleStatus}
        onSetSystemPaymentStatus={handleSystemPaymentStatus}
        onLockUntilPaid={handleLockUntilPaid}
        settlementSummary={
          selectedOwner
            ? ownerStats.get(selectedOwner.id) ?? {
                totalGyms: 0,
                totalCourts: 0,
                grossRevenue: 0,
                systemShare: 0,
                ownerProfit: 0,
              }
            : null
        }
      />
    </div>
  )
}
