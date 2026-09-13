import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react"

import { OwnerStatusBadge } from "@/admin/components/owners/owner-status-badge"
import type {
  OwnerCourtRecord,
  OwnerDetailRecord,
  OwnerTransactionRecord,
  OwnerVenueRecord,
  SystemPaymentStatus,
} from "@/admin/lib/admin-owners-context"
import { useAdminOwners } from "@/admin/lib/admin-owners-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import {
  PaymentStatusBadge,
  TransactionStatusBadge,
} from "@/shared/components/transactions/transaction-status-badge"

type BookingScope =
  | { type: "all"; label: "All owner bookings" }
  | { type: "venue"; venueName: string; label: string }
  | { type: "court"; venueName: string; courtName: string; label: string }

function SystemPaymentStatusBadge({
  status,
}: {
  status: SystemPaymentStatus
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-xs font-medium",
        status === "paid"
          ? "bg-primary/15 text-primary"
          : "bg-amber-500/15 text-amber-700"
      )}
    >
      {status === "paid" ? "Paid to system" : "Unpaid to system"}
    </span>
  )
}

function normalize(value: string) {
  return value.toLowerCase().trim()
}

function isBillableTransaction(transaction: OwnerTransactionRecord) {
  return transaction.paymentStatus === "paid" && transaction.status !== "cancelled"
}

function getTransactionsForVenue(
  transactions: OwnerTransactionRecord[],
  venueName: string
) {
  return transactions.filter((transaction) => transaction.gymName === venueName)
}

function getTransactionsForCourt(
  transactions: OwnerTransactionRecord[],
  venueName: string,
  courtName: string
) {
  return transactions.filter(
    (transaction) =>
      transaction.gymName === venueName && transaction.courtName === courtName
  )
}

function getRevenue(transactions: OwnerTransactionRecord[]) {
  return transactions
    .filter(isBillableTransaction)
    .reduce((total, transaction) => total + transaction.amount, 0)
}

function courtMatchesQuery(court: OwnerCourtRecord, query: string) {
  const normalizedQuery = normalize(query)

  return (
    court.name.toLowerCase().includes(normalizedQuery) ||
    court.surface.toLowerCase().includes(normalizedQuery) ||
    court.capacity.toLowerCase().includes(normalizedQuery) ||
    court.status.toLowerCase().includes(normalizedQuery) ||
    court.bookingMode.toLowerCase().includes(normalizedQuery)
  )
}

function venueMatchesQuery(venue: OwnerVenueRecord, query: string) {
  const normalizedQuery = normalize(query)

  return (
    venue.name.toLowerCase().includes(normalizedQuery) ||
    venue.address.toLowerCase().includes(normalizedQuery) ||
    venue.status.toLowerCase().includes(normalizedQuery) ||
    (venue.phone ?? "").toLowerCase().includes(normalizedQuery)
  )
}

function scopeMatchesTransaction(
  transaction: OwnerTransactionRecord,
  scope: BookingScope
) {
  if (scope.type === "all") {
    return true
  }

  if (scope.type === "venue") {
    return transaction.gymName === scope.venueName
  }

  return (
    transaction.gymName === scope.venueName &&
    transaction.courtName === scope.courtName
  )
}

export function AdminOwnerDetailPage() {
  const { ownerId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const {
    getOwnerDetail,
    setOwnerStatus,
    setSystemPaymentStatus,
    lockOwnerUntilPaid,
    unlockOwner,
  } = useAdminOwners()
  const [detail, setDetail] = useState<OwnerDetailRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [venueQuery, setVenueQuery] = useState("")
  const [bookingScope, setBookingScope] = useState<BookingScope>({
    type: "all",
    label: "All owner bookings",
  })

  const owner = detail?.owner ?? null
  const venues = detail?.venues ?? []
  const transactions = detail?.transactions ?? []

  const totals = useMemo(
    () => ({
      gyms: venues.length,
      courts: venues.reduce((count, venue) => count + venue.courts.length, 0),
      activeCourts: venues.reduce(
        (count, venue) =>
          count +
          venue.courts.filter((court) => court.status === "available").length,
        0
      ),
      maintenanceCourts: venues.reduce(
        (count, venue) =>
          count +
          venue.courts.filter((court) => court.status === "maintenance").length,
        0
      ),
      openPlayCourts: venues.reduce(
        (count, venue) =>
          count +
          venue.courts.filter((court) => court.bookingMode === "open_play")
            .length,
        0
      ),
    }),
    [venues]
  )

  const filteredVenues = useMemo(() => {
    const query = venueQuery.trim()

    if (!query) {
      return venues
    }

    return venues
      .map((venue) => {
        if (venueMatchesQuery(venue, query)) {
          return venue
        }

        return {
          ...venue,
          courts: venue.courts.filter((court) => courtMatchesQuery(court, query)),
        }
      })
      .filter((venue) => venue.courts.length > 0 || venueMatchesQuery(venue, query))
  }, [venues, venueQuery])

  const scopedTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        scopeMatchesTransaction(transaction, bookingScope)
      ),
    [bookingScope, transactions]
  )

  async function loadOwnerDetail() {
    if (!ownerId) {
      setError("Owner was not found.")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const nextDetail = await getOwnerDetail(ownerId)
      setDetail(nextDetail)
      setError(null)
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load owner details."
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOwnerDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId])

  async function runOwnerAction(action: () => Promise<void>, success: string) {
    setIsSubmitting(true)
    try {
      await action()
      await loadOwnerDetail()
      toast.add({
        title: success,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to update owner",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        Loading owner profile...
      </p>
    )
  }

  if (error || !owner || !ownerId) {
    return (
      <div className="grid gap-4">
        <Button
          type="button"
          variant="ghost"
          className="w-fit"
          onClick={() => navigate("/admin/owners")}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to owners
        </Button>
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error ?? "Owner was not found."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid min-w-0 gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Button
            type="button"
            variant="ghost"
            className="mb-3 w-fit px-0 hover:bg-transparent"
            onClick={() => navigate("/admin/owners")}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to owners
          </Button>
          <p className="text-sm font-medium text-primary">Owner profile</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {owner.name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review the owner account, payment settlement, owned gyms, courts,
            and related bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OwnerStatusBadge status={owner.status} />
          <SystemPaymentStatusBadge status={owner.systemPaymentStatus} />
        </div>
      </div>

      {owner.suspensionReason === "system_payment_due" ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            This owner is locked until the unpaid system share is marked paid.
          </span>
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="size-4 text-primary" aria-hidden="true" />
            <h3 className="font-semibold">Basic information</h3>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Name</p>
              <p className="mt-1 font-medium">{owner.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Joined</p>
              <p className="mt-1 inline-flex items-center gap-1.5">
                <CalendarDays
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {owner.joinedAt ? owner.joinedAt.slice(0, 10) : "--"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Email</p>
              <p className="mt-1 inline-flex min-w-0 items-center gap-1.5">
                <Mail
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="break-all">{owner.email}</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Phone</p>
              <p className="mt-1 inline-flex items-center gap-1.5">
                <Phone
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {owner.phone ?? "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <CircleDollarSign
              className="size-4 text-primary"
              aria-hidden="true"
            />
            <h3 className="font-semibold">Settlement</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Gyms</p>
              <p className="mt-1 text-lg font-semibold">{totals.gyms}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Courts</p>
              <p className="mt-1 text-lg font-semibold">{totals.courts}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Owner profit
              </p>
              <p className="mt-1 font-semibold">
                {formatCurrency(owner.ownerProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                System share
              </p>
              <p className="mt-1 font-semibold">
                {formatCurrency(owner.systemShare)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() =>
                void runOwnerAction(
                  () =>
                    setSystemPaymentStatus(
                      owner.id,
                      owner.systemPaymentStatus === "paid" ? "unpaid" : "paid"
                    ),
                  owner.systemPaymentStatus === "paid"
                    ? "System share marked unpaid"
                    : "System share marked paid"
                )
              }
            >
              {owner.systemPaymentStatus === "paid"
                ? "Mark unpaid"
                : "Mark paid"}
            </Button>
            {owner.systemPaymentStatus === "unpaid" &&
            owner.status === "active" ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isSubmitting}
                onClick={() =>
                  void runOwnerAction(
                    () => lockOwnerUntilPaid(owner.id),
                    "Owner locked"
                  )
                }
              >
                Lock until paid
              </Button>
            ) : null}
            {owner.suspensionReason === "system_payment_due" &&
            owner.systemPaymentStatus === "paid" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() =>
                  void runOwnerAction(
                    () => unlockOwner(owner.id),
                    "Owner access restored"
                  )
                }
              >
                Restore access
              </Button>
            ) : null}
            <Button
              type="button"
              variant={owner.status === "active" ? "destructive" : "outline"}
              size="sm"
              disabled={isSubmitting}
              onClick={() =>
                void runOwnerAction(
                  () =>
                    setOwnerStatus(
                      owner.id,
                      owner.status === "active" ? "suspended" : "active",
                      owner.status === "active" ? "manual_review" : undefined
                    ),
                  owner.status === "active"
                    ? "Owner suspended"
                    : "Owner reactivated"
                )
              }
            >
              {owner.status === "active" ? "Suspend" : "Reactivate"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs uppercase text-muted-foreground">Available</p>
          <p className="mt-1 text-xl font-semibold">{totals.activeCourts}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs uppercase text-muted-foreground">Maintenance</p>
          <p className="mt-1 text-xl font-semibold">
            {totals.maintenanceCourts}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs uppercase text-muted-foreground">Open Play</p>
          <p className="mt-1 text-xl font-semibold">{totals.openPlayCourts}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Owner revenue
          </p>
          <p className="mt-1 text-xl font-semibold">
            {formatCurrency(getRevenue(transactions))}
          </p>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Owned venues</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">
              Gyms and courts
            </h3>
          </div>
          <div className="relative min-w-0 lg:w-80">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="h-9 pl-8"
              placeholder="Search gyms or courts"
              value={venueQuery}
              onChange={(event) => setVenueQuery(event.target.value)}
            />
          </div>
        </div>

        {filteredVenues.length === 0 ? (
          <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
            No gyms or courts match your search.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredVenues.map((venue) => {
              const venueTransactions = getTransactionsForVenue(
                transactions,
                venue.name
              )
              const activeCourts = venue.courts.filter(
                (court) => court.status === "available"
              ).length
              const maintenanceCourts = venue.courts.filter(
                (court) => court.status === "maintenance"
              ).length
              const openPlayCourts = venue.courts.filter(
                (court) => court.bookingMode === "open_play"
              ).length

              return (
                <article key={venue.id} className="rounded-lg border bg-card">
                  <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2
                          className="size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <h4 className="truncate text-base font-semibold">
                          {venue.name}
                        </h4>
                      </div>
                      <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin
                          className="mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{venue.address}</span>
                      </p>
                      {venue.phone ? (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="size-4" aria-hidden="true" />
                          {venue.phone}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
                        {venue.status}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setBookingScope({
                            type: "venue",
                            venueName: venue.name,
                            label: venue.name,
                          })
                        }
                      >
                        View bookings
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-b p-3 text-sm lg:grid-cols-5">
                    <div className="rounded-md bg-muted/40 p-2">
                      <p className="text-xs text-muted-foreground">Courts</p>
                      <p className="font-semibold">{venue.courts.length}</p>
                    </div>
                    <div className="rounded-md bg-muted/40 p-2">
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="font-semibold">{activeCourts}</p>
                    </div>
                    <div className="rounded-md bg-muted/40 p-2">
                      <p className="text-xs text-muted-foreground">
                        Maintenance
                      </p>
                      <p className="font-semibold">{maintenanceCourts}</p>
                    </div>
                    <div className="rounded-md bg-muted/40 p-2">
                      <p className="text-xs text-muted-foreground">Open Play</p>
                      <p className="font-semibold">{openPlayCourts}</p>
                    </div>
                    <div className="rounded-md bg-primary/10 p-2">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-semibold">
                        {formatCurrency(getRevenue(venueTransactions))}
                      </p>
                    </div>
                  </div>

                  {venue.courts.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">
                      No courts have been added to this gym yet.
                    </p>
                  ) : (
                    <div className="divide-y">
                      {venue.courts.map((court) => {
                        const courtTransactions = getTransactionsForCourt(
                          transactions,
                          venue.name,
                          court.name
                        )

                        return (
                          <div
                            key={court.id}
                            className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{court.name}</p>
                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                                  {court.status}
                                </span>
                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                                  {court.bookingMode === "open_play"
                                    ? "Open Play"
                                    : "Court booking"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {court.surface} - {court.capacity}
                                {court.openPlayCapacity
                                  ? ` - ${court.openPlayCapacity} players`
                                  : ""}
                              </p>
                            </div>
                            <div className="grid gap-1 text-sm lg:text-right">
                              <span className="font-medium">
                                {formatCurrency(court.pricePerHour)}/hr
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(getRevenue(courtTransactions))}{" "}
                                revenue
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-fit"
                              onClick={() =>
                                setBookingScope({
                                  type: "court",
                                  venueName: venue.name,
                                  courtName: court.name,
                                  label: `${venue.name} / ${court.name}`,
                                })
                              }
                            >
                              View bookings
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Bookings</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">
              {bookingScope.label}
            </h3>
          </div>
          {bookingScope.type !== "all" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setBookingScope({ type: "all", label: "All owner bookings" })
              }
            >
              <X className="size-4" aria-hidden="true" />
              Clear filter
            </Button>
          ) : null}
        </div>

        {scopedTransactions.length === 0 ? (
          <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
            No bookings found for this selection.
          </p>
        ) : (
          <div className="grid gap-2">
            {scopedTransactions.slice(0, 12).map((transaction) => (
              <div
                key={transaction.id}
                className="grid gap-3 rounded-lg border bg-card p-3 text-sm lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <ReceiptText
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    <p className="font-medium">{transaction.customerName}</p>
                    <span className="text-muted-foreground">
                      {transaction.bookingId}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {transaction.gymName} - {transaction.courtName} -{" "}
                    {transaction.bookingDate}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <span className="font-medium">
                    {formatCurrency(transaction.amount)}
                  </span>
                  <PaymentStatusBadge status={transaction.paymentStatus} />
                  <TransactionStatusBadge status={transaction.status} />
                </div>
              </div>
            ))}
            {scopedTransactions.length > 12 ? (
              <p className="text-center text-sm text-muted-foreground">
                Showing 12 of {scopedTransactions.length} bookings.
              </p>
            ) : null}
          </div>
        )}
      </section>

      <div>
        <Link
          to="/admin/owners"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to owner list
        </Link>
      </div>
    </div>
  )
}
