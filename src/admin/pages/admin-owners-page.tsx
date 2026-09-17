import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { KeyRound, Search, UserPlus } from "lucide-react"

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
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/admin/lib/admin-auth-context"
import { sanitizeEmail, sanitizeText } from "@/lib/validation"
const quickFilters = ["all", "paid", "unpaid", "suspended"] as const
type QuickFilter = (typeof quickFilters)[number]

const createOwnerInitialState = {
  fullName: "",
  email: "",
  phone: "",
  businessName: "",
  temporaryPassword: "",
}

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
    createOwner,
    setSystemPaymentStatus,
    setOwnerSystemFee,
    lockOwnerUntilPaid,
  } = useAdminOwners()
  const { admin } = useAdminAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [systemPaymentFilter, setSystemPaymentFilter] = useState<
    SystemPaymentStatus | "all"
  >("all")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [feeDrafts, setFeeDrafts] = useState<Record<string, string>>({})
  const [showCreateOwner, setShowCreateOwner] = useState(false)
  const [createOwnerDraft, setCreateOwnerDraft] = useState(createOwnerInitialState)
  const [createdOwnerCredentials, setCreatedOwnerCredentials] = useState<{
    name: string
    email: string
    temporaryPassword: string
  } | null>(null)
  const [isCreatingOwner, setIsCreatingOwner] = useState(false)
  const [submittingFeeOwnerId, setSubmittingFeeOwnerId] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!admin?.token) {
      return
    }
    void refreshOwners({ dateFrom, dateTo })
  }, [admin?.token, dateFrom, dateTo, refreshOwners])

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

  function getFeeDraft(owner: OwnerRecord) {
    return feeDrafts[owner.id] ?? String(owner.systemFeePerTransaction)
  }

  function generateTemporaryPassword() {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    const digits = "23456789"
    const symbols = "!@#%"
    const all = `${letters}${digits}${symbols}`
    const values = new Uint32Array(12)
    window.crypto.getRandomValues(values)
    const password = [
      letters[values[0] % letters.length],
      digits[values[1] % digits.length],
      symbols[values[2] % symbols.length],
      ...Array.from(values.slice(3), (value) => all[value % all.length]),
    ].join("")
    setCreateOwnerDraft((current) => ({
      ...current,
      temporaryPassword: password,
    }))
  }

  async function handleCreateOwner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fullName = sanitizeText(createOwnerDraft.fullName)
    const email = sanitizeEmail(createOwnerDraft.email)
    const phone = sanitizeText(createOwnerDraft.phone)
    const businessName = sanitizeText(createOwnerDraft.businessName)
    const temporaryPassword = createOwnerDraft.temporaryPassword.trim()

    if (!fullName || !email || !temporaryPassword) {
      toast.add({
        title: "Owner details incomplete",
        description: "Owner name, email, and temporary password are required.",
        type: "error",
      })
      return
    }
    if (temporaryPassword.length < 8 || !/[A-Za-z]/.test(temporaryPassword) || !/\d/.test(temporaryPassword)) {
      toast.add({
        title: "Temporary password is weak",
        description: "Use at least 8 characters with a letter and a number.",
        type: "error",
      })
      return
    }

    setIsCreatingOwner(true)
    try {
      const owner = await createOwner({
        fullName,
        email,
        phone,
        businessName,
        temporaryPassword,
      })
      toast.add({
        title: "Owner account created",
        description: `${owner.name} must change the temporary password on first login.`,
        type: "success",
      })
      setCreatedOwnerCredentials({
        name: owner.name,
        email: owner.email,
        temporaryPassword,
      })
      setCreateOwnerDraft(createOwnerInitialState)
      setShowCreateOwner(false)
      await refreshOwners({ dateFrom, dateTo })
    } catch (error) {
      toast.add({
        title: "Unable to create owner",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    } finally {
      setIsCreatingOwner(false)
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
    } catch (error) {
      toast.add({
        title: "Unable to update settlement",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleSystemFeeSave(id: string) {
    const owner = owners.find((current) => current.id === id)
    if (!owner) {
      return
    }

    const nextFee = Number(getFeeDraft(owner))
    if (!Number.isFinite(nextFee) || nextFee < 0) {
      toast.add({
        title: "Invalid system fee",
        description: "Enter a valid fee amount of 0 or higher.",
        type: "error",
      })
      return
    }

    setSubmittingFeeOwnerId(id)
    try {
      await setOwnerSystemFee(id, nextFee)
      toast.add({
        title: "System fee updated",
        description: `${owner.name} is now charged ${formatCurrency(nextFee)} per billable transaction.`,
        type: "success",
      })
      setFeeDrafts((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      await refreshOwners({ dateFrom, dateTo })
    } catch (error) {
      toast.add({
        title: "Unable to update system fee",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    } finally {
      setSubmittingFeeOwnerId(null)
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
    } catch (error) {
      toast.add({
        title: "Unable to lock owner",
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
        <Button
          type="button"
          className="w-fit gap-2"
          onClick={() => setShowCreateOwner((current) => !current)}
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {showCreateOwner ? "Close" : "Create owner"}
        </Button>
      </div>

      {showCreateOwner ? (
        <form
          className="grid gap-4 rounded-lg border bg-card p-4"
          onSubmit={handleCreateOwner}
        >
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <h3 className="text-base font-semibold">New owner account</h3>
              <p className="text-sm text-muted-foreground">
                Admin-created owners receive a temporary password and must change it before using the owner console.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-fit gap-2"
              onClick={generateTemporaryPassword}
            >
              <KeyRound className="size-4" aria-hidden="true" />
              Generate password
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="grid gap-1.5 xl:col-span-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="owner-full-name">
                Owner name
              </label>
              <Input
                id="owner-full-name"
                value={createOwnerDraft.fullName}
                onChange={(event) =>
                  setCreateOwnerDraft((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                placeholder="Owner name"
                required
              />
            </div>
            <div className="grid gap-1.5 xl:col-span-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="owner-email">
                Email
              </label>
              <Input
                id="owner-email"
                type="email"
                value={createOwnerDraft.email}
                onChange={(event) =>
                  setCreateOwnerDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="owner@gym.com"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="owner-business">
                Business name
              </label>
              <Input
                id="owner-business"
                value={createOwnerDraft.businessName}
                onChange={(event) =>
                  setCreateOwnerDraft((current) => ({
                    ...current,
                    businessName: event.target.value,
                  }))
                }
                placeholder="Gym name"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="owner-phone">
                Phone
              </label>
              <Input
                id="owner-phone"
                value={createOwnerDraft.phone}
                onChange={(event) =>
                  setCreateOwnerDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="owner-temp-password">
                Temporary password
              </label>
              <Input
                id="owner-temp-password"
                value={createOwnerDraft.temporaryPassword}
                onChange={(event) =>
                  setCreateOwnerDraft((current) => ({
                    ...current,
                    temporaryPassword: event.target.value,
                  }))
                }
                placeholder="Temporary password"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCreateOwnerDraft(createOwnerInitialState)
                setShowCreateOwner(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingOwner}>
              {isCreatingOwner ? "Creating..." : "Create owner"}
            </Button>
          </div>
        </form>
      ) : null}

      {createdOwnerCredentials ? (
        <div className="grid gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-sm font-semibold">Owner login details ready</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share these details with {createdOwnerCredentials.name}. They will be required to set a new password before accessing the owner console.
            </p>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <div className="rounded-md bg-background px-3 py-2">
                <span className="block text-xs text-muted-foreground">Email</span>
                <span className="font-medium">{createdOwnerCredentials.email}</span>
              </div>
              <div className="rounded-md bg-background px-3 py-2">
                <span className="block text-xs text-muted-foreground">Temporary password</span>
                <span className="font-mono font-medium">
                  {createdOwnerCredentials.temporaryPassword}
                </span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCreatedOwnerCredentials(null)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

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
                <th className="px-4 py-3 font-medium">Fee / transaction</th>
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
                      {owner.mustChangePassword ? (
                        <div className="mt-1 inline-flex items-center rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Password reset required
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {owner.joinedAt ? owner.joinedAt.slice(0, 10) : "--"}
                    </td>
                    <td className="px-4 py-3">{owner.totalGyms}</td>
                    <td className="px-4 py-3">{owner.totalCourts}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(owner.ownerProfit)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-44 items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={getFeeDraft(owner)}
                          onChange={(event) =>
                            setFeeDrafts((current) => ({
                              ...current,
                              [owner.id]: event.target.value,
                            }))
                          }
                          className="h-8 w-24"
                          aria-label={`System fee per transaction for ${owner.name}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            submittingFeeOwnerId === owner.id ||
                            Number(getFeeDraft(owner)) ===
                              owner.systemFeePerTransaction
                          }
                          onClick={() => void handleSystemFeeSave(owner.id)}
                        >
                          {submittingFeeOwnerId === owner.id ? "Saving" : "Save"}
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {owner.systemFeeBillableCount} billable transaction
                        {owner.systemFeeBillableCount === 1 ? "" : "s"}
                      </p>
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
                          onClick={() => navigate(`/admin/owners/${owner.id}`)}
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
    </div>
  )
}
