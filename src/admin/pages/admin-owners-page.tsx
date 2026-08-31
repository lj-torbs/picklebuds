import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"

import { OwnerDetailSheet } from "@/admin/components/owners/owner-detail-sheet"
import { OwnerStatusBadge } from "@/admin/components/owners/owner-status-badge"
import type {
  OwnerDetailRecord,
  OwnerRecord,
  SystemPaymentStatus,
} from "@/admin/lib/admin-owners-context"
import { useAdminOwners } from "@/admin/lib/admin-owners-context"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/admin/lib/admin-auth-context"
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
  const {
    owners,
    isLoading,
    error,
    refreshOwners,
    getOwnerDetail,
    setOwnerStatus,
    setSystemPaymentStatus,
    lockOwnerUntilPaid,
    unlockOwner,
  } = useAdminOwners()
  const { admin } = useAdminAuth()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null)
  const [selectedOwnerDetail, setSelectedOwnerDetail] =
    useState<OwnerDetailRecord | null>(null)
  const [systemPaymentFilter, setSystemPaymentFilter] = useState<
    SystemPaymentStatus | "all"
  >("all")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    if (!admin?.token) {
      return
    }
    void refreshOwners({ dateFrom, dateTo })
  }, [admin?.token, dateFrom, dateTo, refreshOwners])

  useEffect(() => {
    if (!selectedOwnerId || !admin?.token) {
      return
    }

    let isActive = true
    void getOwnerDetail(selectedOwnerId, { dateFrom, dateTo })
      .then((detail) => {
        if (isActive) {
          setSelectedOwnerDetail(detail)
        }
      })
      .catch((nextError) => {
        if (!isActive) {
          return
        }
        setSelectedOwnerDetail(null)
        toast.add({
          title: "Unable to load owner details",
          description:
            nextError instanceof Error
              ? nextError.message
              : "Please try again.",
          type: "error",
        })
      })

    return () => {
      isActive = false
    }
  }, [admin?.token, dateFrom, dateTo, getOwnerDetail, selectedOwnerId, toast])

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

  const selectedOwner = owners.find((owner) => owner.id === selectedOwnerId) ?? null

  async function handleToggleStatus(id: string) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    const nextStatus = owner.status === "active" ? "suspended" : "active"
    try {
      await setOwnerStatus(
        id,
        nextStatus,
        nextStatus === "suspended" ? "manual_review" : undefined
      )
      toast.add({
        title: nextStatus === "suspended" ? "Owner suspended" : "Owner reactivated",
        description: `${owner.name} is now ${nextStatus}.`,
        type: "success",
      })
      if (selectedOwnerId === id) {
        const detail = await getOwnerDetail(id, { dateFrom, dateTo })
        setSelectedOwnerDetail(detail)
      }
    } catch (error) {
      toast.add({
        title: "Unable to update owner",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleSystemPaymentStatus(
    id: string,
    status: SystemPaymentStatus
  ) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    try {
      await setSystemPaymentStatus(id, status)
      toast.add({
        title:
          status === "paid" ? "System share marked paid" : "System share marked unpaid",
        description: `${owner.name} is now ${status} for admin settlement.`,
        type: "success",
      })
      await refreshOwners({ dateFrom, dateTo })
      if (selectedOwnerId === id) {
        const detail = await getOwnerDetail(id, { dateFrom, dateTo })
        setSelectedOwnerDetail(detail)
      }
    } catch (error) {
      toast.add({
        title: "Unable to update settlement",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleLockUntilPaid(id: string) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    try {
      await lockOwnerUntilPaid(id)
      toast.add({
        title: "Owner locked",
        description: `${owner.name} must pay the system share first before access is restored.`,
        type: "success",
      })
      if (selectedOwnerId === id) {
        const detail = await getOwnerDetail(id, { dateFrom, dateTo })
        setSelectedOwnerDetail(detail)
      }
    } catch (error) {
      toast.add({
        title: "Unable to lock owner",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleUnlock(id: string) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    try {
      await unlockOwner(id)
      toast.add({
        title: "Owner access restored",
        description: `${owner.name} can access the owner panel again.`,
        type: "success",
      })
      if (selectedOwnerId === id) {
        const detail = await getOwnerDetail(id, { dateFrom, dateTo })
        setSelectedOwnerDetail(detail)
      }
    } catch (error) {
      toast.add({
        title: "Unable to unlock owner",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    }
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

      {isLoading ? (
        <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          Loading owners...
        </p>
      ) : error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </p>
      ) : filteredOwners.length === 0 ? (
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
                return (
                  <tr key={owner.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{owner.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {owner.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {owner.joinedAt ? owner.joinedAt.slice(0, 10) : "--"}
                    </td>
                    <td className="px-4 py-3">{owner.totalGyms}</td>
                    <td className="px-4 py-3">{owner.totalCourts}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(owner.ownerProfit)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(owner.systemShare)}
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
        owner={selectedOwnerDetail?.owner ?? selectedOwner}
        transactions={selectedOwnerDetail?.transactions ?? []}
        open={selectedOwner !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOwnerId(null)
            setSelectedOwnerDetail(null)
          }
        }}
        onToggleStatus={handleToggleStatus}
        onSetSystemPaymentStatus={handleSystemPaymentStatus}
        onLockUntilPaid={handleLockUntilPaid}
        onUnlock={handleUnlock}
        settlementSummary={
          selectedOwnerDetail
            ? {
                totalGyms: selectedOwnerDetail.owner.totalGyms,
                totalCourts: selectedOwnerDetail.owner.totalCourts,
                grossRevenue: selectedOwnerDetail.owner.grossRevenue,
                systemShare: selectedOwnerDetail.owner.systemShare,
                ownerProfit: selectedOwnerDetail.owner.ownerProfit,
              }
            : selectedOwner
              ? {
                  totalGyms: selectedOwner.totalGyms,
                  totalCourts: selectedOwner.totalCourts,
                  grossRevenue: selectedOwner.grossRevenue,
                  systemShare: selectedOwner.systemShare,
                  ownerProfit: selectedOwner.ownerProfit,
                }
              : null
        }
      />
    </div>
  )
}
