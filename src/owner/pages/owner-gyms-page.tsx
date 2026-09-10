import { Fragment, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  CalendarClock,
  ChevronDown,
  CreditCard,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import { CourtFormSheet } from "@/shared/components/gyms/court-form-sheet"
import {
  CourtStatusBadge,
  GymStatusBadge,
} from "@/shared/components/gyms/gym-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/toast"
import {
  createOwnerCourtWithApi,
  deleteOwnerCourtWithApi,
  deleteOwnerVenueWithApi,
  getOwnerVenuesWithApi,
  setOwnerCourtStatusWithApi,
  setOwnerVenueStatusWithApi,
  updateOwnerCourtWithApi,
} from "@/lib/owner-api"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { mapOwnerVenueToGym } from "@/owner/lib/owner-venue-mappers"
import type { Court, CourtStatus, Gym } from "@/shared/lib/gyms-context"

export function OwnerGymsPage() {
  const { owner } = useOwnerAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [error, setError] = useState<string | null>(null)
  const [courtFormOpen, setCourtFormOpen] = useState(false)
  const [activeGymId, setActiveGymId] = useState<string | null>(null)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [expandedGymIds, setExpandedGymIds] = useState<Set<string>>(
    () => new Set()
  )
  const [confirmingRemoveCourtId, setConfirmingRemoveCourtId] = useState<
    string | null
  >(null)
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null)
  const [confirmingRemoveGymId, setConfirmingRemoveGymId] = useState<
    string | null
  >(null)
  const [deletingGymId, setDeletingGymId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!owner?.token) {
      return
    }

    let isActive = true

    void getOwnerVenuesWithApi(owner.token)
      .then((items) => {
        if (!isActive) {
          return
        }
        setGyms(items.map(mapOwnerVenueToGym))
        setError(null)
      })
      .catch((nextError) => {
        if (!isActive) {
          return
        }
        setGyms([])
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load your gyms."
        )
      })

    return () => {
      isActive = false
    }
  }, [owner?.token])

  function replaceGym(nextGym: Gym) {
    setGyms((current) =>
      current.map((gym) => (gym.id === nextGym.id ? nextGym : gym))
    )
  }

  function removeGym(gymId: string) {
    setGyms((current) => current.filter((gym) => gym.id !== gymId))
    setExpandedGymIds((current) => {
      const next = new Set(current)
      next.delete(gymId)
      return next
    })
  }

  function getCourtActionId(gymId: string, courtId: string) {
    return `${gymId}:${courtId}`
  }

  function openAddCourt(gymId: string) {
    setActiveGymId(gymId)
    setEditingCourt(null)
    setConfirmingRemoveCourtId(null)
    setConfirmingRemoveGymId(null)
    setCourtFormOpen(true)
  }

  function toggleGymExpansion(gymId: string) {
    setExpandedGymIds((current) => {
      const next = new Set(current)
      if (next.has(gymId)) {
        next.delete(gymId)
      } else {
        next.add(gymId)
      }
      return next
    })
  }

  async function handleSaveCourt(values: {
    name: string
    surface: string
    capacity: string
    pricePerHour: number
    imageUrl?: string
    status: CourtStatus
    bookingMode: Court["bookingMode"]
    openPlayCapacity?: number
    availableSlots: string[]
  }) {
    if (!owner?.token || !activeGymId) {
      return
    }

    try {
      const response = editingCourt
        ? await updateOwnerCourtWithApi(
            owner.token,
            activeGymId,
            editingCourt.id,
            values
          )
        : await createOwnerCourtWithApi(owner.token, activeGymId, values)
      replaceGym(mapOwnerVenueToGym(response))
      toast.add({
        title: editingCourt ? "Court updated" : "Court added",
        description: `${values.name} has been ${editingCourt ? "updated" : "added"}.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to save court",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleToggleGymStatus(gym: Gym) {
    if (!owner?.token) {
      return
    }

    const nextStatus = gym.status === "active" ? "inactive" : "active"
    try {
      const response = await setOwnerVenueStatusWithApi(
        owner.token,
        gym.id,
        nextStatus
      )
      replaceGym(mapOwnerVenueToGym(response))
      toast.add({
        title: nextStatus === "active" ? "Gym activated" : "Gym deactivated",
        description: `${gym.name} is now ${nextStatus}.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to update gym",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleRemoveGym(gym: Gym) {
    if (!owner?.token) {
      return
    }

    setDeletingGymId(gym.id)

    try {
      await deleteOwnerVenueWithApi(owner.token, gym.id)
      removeGym(gym.id)
      setConfirmingRemoveGymId(null)
      toast.add({
        title: "Gym deleted",
        description: `${gym.name} has been removed.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to delete gym",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    } finally {
      setDeletingGymId(null)
    }
  }

  async function handleToggleCourtStatus(gymId: string, court: Court) {
    if (!owner?.token) {
      return
    }

    const nextStatus =
      court.status === "available" ? "maintenance" : "available"
    try {
      const response = await setOwnerCourtStatusWithApi(
        owner.token,
        gymId,
        court.id,
        nextStatus
      )
      replaceGym(mapOwnerVenueToGym(response))
      toast.add({
        title: "Court status updated",
        description: `${court.name} is now ${nextStatus}.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to update court",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleRemoveCourt(gymId: string, court: Court) {
    if (!owner?.token) {
      return
    }

    const courtActionId = getCourtActionId(gymId, court.id)
    setDeletingCourtId(courtActionId)

    try {
      const response = await deleteOwnerCourtWithApi(
        owner.token,
        gymId,
        court.id
      )
      replaceGym(mapOwnerVenueToGym(response))
      setConfirmingRemoveCourtId(null)
      toast.add({
        title: "Court removed",
        description: `${court.name} has been removed.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to remove court",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    } finally {
      setDeletingCourtId(null)
    }
  }

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()

  function courtMatchesQuery(court: Court) {
    if (!normalizedSearchQuery) {
      return true
    }

    return [
      court.name,
      court.surface,
      court.capacity,
      court.status,
      court.bookingMode,
      String(court.pricePerHour),
    ].some((value) => value.toLowerCase().includes(normalizedSearchQuery))
  }

  function gymMatchesQuery(gym: Gym) {
    if (!normalizedSearchQuery) {
      return true
    }

    return [
      gym.name,
      gym.address,
      gym.phone,
      gym.status,
      ...gym.paymentOptions.map((option) => option.provider),
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(normalizedSearchQuery)
      )
  }

  function getVisibleCourts(gym: Gym) {
    if (!normalizedSearchQuery || gymMatchesQuery(gym)) {
      return gym.courts
    }

    return gym.courts.filter(courtMatchesQuery)
  }

  const filteredGyms = useMemo(
    () =>
      gyms.filter(
        (gym) =>
          gymMatchesQuery(gym) || gym.courts.some((court) => courtMatchesQuery(court))
      ),
    [gyms, normalizedSearchQuery]
  )

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Venues</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              My gyms
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan venue setup, payment coverage, whole-gym booking, and court
              availability without opening bulky cards.
            </p>
          </div>
          <Button type="button" onClick={() => navigate("/owner/gyms/new")}>
            <Plus className="size-4" aria-hidden="true" />
            Add gym
          </Button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : gyms.length === 0 ? (
        <div className="grid gap-4 rounded-lg border bg-card p-6 text-center">
          <div className="grid gap-1">
            <p className="text-sm font-medium">No venues are linked yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first gym to start setting up courts, booking slots, and
              payment collection.
            </p>
          </div>
          <div className="flex justify-center">
            <Button type="button" onClick={() => navigate("/owner/gyms/new")}>
              <Plus className="size-4" aria-hidden="true" />
              Add gym
            </Button>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-9 pl-9"
                placeholder="Search gyms or courts"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredGyms.length} of {gyms.length} venue
              {gyms.length === 1 ? "" : "s"}
            </span>
          </div>
          <CardContent className="p-0">
            {filteredGyms.length === 0 ? (
              <div className="grid gap-1 p-6 text-center">
                <p className="text-sm font-medium">No matching gyms or courts</p>
                <p className="text-sm text-muted-foreground">
                  Try searching by gym name, address, court name, surface, or
                  booking mode.
                </p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[64rem] border-collapse text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="w-10 px-4 py-3 text-left font-medium" />
                    <th className="px-4 py-3 text-left font-medium">Gym</th>
                    <th className="px-4 py-3 text-left font-medium">Courts</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Payments
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Whole gym
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGyms.map((gym) => {
                    const isExpanded =
                      expandedGymIds.has(gym.id) || Boolean(normalizedSearchQuery)
                    const visibleCourts = getVisibleCourts(gym)
                    const availableCourts = gym.courts.filter(
                      (court) => court.status === "available"
                    ).length
                    const courtRateRange = gym.courts.length
                      ? `${formatCurrency(
                          Math.min(
                            ...gym.courts.map((court) => court.pricePerHour)
                          )
                        )}-${formatCurrency(
                          Math.max(
                            ...gym.courts.map((court) => court.pricePerHour)
                          )
                        )}/hr`
                      : "No rate"

                    return (
                      <Fragment key={gym.id}>
                        <tr className="border-b align-top">
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => toggleGymExpansion(gym.id)}
                              className="flex size-8 items-center justify-center rounded-md border bg-background transition hover:border-primary/50 hover:bg-primary/5"
                              aria-label={
                                isExpanded
                                  ? `Collapse ${gym.name}`
                                  : `Expand ${gym.name}`
                              }
                            >
                              <ChevronDown
                                className={`size-4 transition ${isExpanded ? "" : "-rotate-90"}`}
                                aria-hidden="true"
                              />
                            </button>
                          </td>
                          <td className="max-w-[22rem] px-4 py-4">
                            <div className="flex min-w-0 gap-3">
                              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                                {gym.imageUrl ? (
                                  <img
                                    src={gym.imageUrl}
                                    alt={`${gym.name} cover`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Building2
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {gym.name}
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                  <MapPin
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {gym.address}
                                </p>
                                {gym.phone ? (
                                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                    <Phone
                                      className="size-3.5 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {gym.phone}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="grid gap-1">
                              <span className="font-medium">
                                {availableCourts}/{gym.courts.length} available
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {courtRateRange}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {gym.paymentOptions.length > 0 ? (
                              <div className="flex max-w-56 flex-wrap gap-1.5">
                                {gym.paymentOptions
                                  .slice(0, 3)
                                  .map((option, index) => (
                                    <span
                                      key={`${option.provider}-${option.accountNumber}-${index}`}
                                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium"
                                    >
                                      <CreditCard
                                        className="size-3"
                                        aria-hidden="true"
                                      />
                                      {option.provider}
                                    </span>
                                  ))}
                                {gym.paymentOptions.length > 3 ? (
                                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                    +{gym.paymentOptions.length - 3}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-destructive">
                                No payment setup
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {gym.wholeGymBooking?.enabled ? (
                              <div className="grid gap-1">
                                <span className="font-medium">
                                  {formatCurrency(
                                    gym.wholeGymBooking.pricePerHour
                                  )}
                                  /hr
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <CalendarClock
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                  {gym.wholeGymBooking.availableSlots.length}{" "}
                                  slots
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Disabled
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <GymStatusBadge status={gym.status} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openAddCourt(gym.id)}
                              >
                                <Plus className="size-4" aria-hidden="true" />
                                Court
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Edit ${gym.name}`}
                                onClick={() => {
                                  setConfirmingRemoveGymId(null)
                                  navigate(`/owner/gyms/${gym.id}/edit`)
                                }}
                              >
                                <Pencil className="size-4" aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleGymStatus(gym)}
                              >
                                {gym.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </Button>
                              {confirmingRemoveGymId === gym.id ? (
                                <>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={deletingGymId === gym.id}
                                    onClick={() => handleRemoveGym(gym)}
                                  >
                                    {deletingGymId === gym.id ? (
                                      <Loader2
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                    Confirm delete
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={deletingGymId === gym.id}
                                    onClick={() =>
                                      setConfirmingRemoveGymId(null)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Delete ${gym.name}`}
                                  title={`Delete ${gym.name}`}
                                  onClick={() => {
                                    setConfirmingRemoveCourtId(null)
                                    setConfirmingRemoveGymId(gym.id)
                                  }}
                                >
                                  <Trash2
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr className="border-b">
                            <td className="bg-muted/20 px-4 py-4" />
                            <td colSpan={6} className="bg-muted/20 px-4 py-4">
                              <div className="grid gap-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium">
                                    Courts at {gym.name}
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAddCourt(gym.id)}
                                  >
                                    <Plus
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                    Add court
                                  </Button>
                                </div>

                                {visibleCourts.length === 0 ? (
                                  <div className="rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
                                    {gym.courts.length === 0
                                      ? "No courts yet. Add one to start taking bookings."
                                      : "No courts in this gym match your search."}
                                  </div>
                                ) : (
                                  <div className="overflow-hidden rounded-lg border bg-card">
                                    <table className="w-full min-w-[48rem] border-collapse text-sm">
                                      <thead className="bg-background text-xs text-muted-foreground">
                                        <tr className="border-b">
                                          <th className="px-3 py-2 text-left font-medium">
                                            Court
                                          </th>
                                          <th className="px-3 py-2 text-left font-medium">
                                            Mode
                                          </th>
                                          <th className="px-3 py-2 text-left font-medium">
                                            Rate
                                          </th>
                                          <th className="px-3 py-2 text-left font-medium">
                                            Availability
                                          </th>
                                          <th className="px-3 py-2 text-left font-medium">
                                            Status
                                          </th>
                                          <th className="px-3 py-2 text-right font-medium">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {visibleCourts.map((court) => (
                                          <tr
                                            key={court.id}
                                            className="border-b last:border-b-0"
                                          >
                                            <td className="px-3 py-3">
                                              <div className="grid gap-1">
                                                <span className="font-medium">
                                                  {court.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                  {court.surface} /{" "}
                                                  {court.capacity}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-3 py-3">
                                              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                                {court.bookingMode ===
                                                "open-play"
                                                  ? `Open Play${
                                                      court.openPlayCapacity
                                                        ? ` / ${court.openPlayCapacity} players`
                                                        : ""
                                                    }`
                                                  : "Private"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-3 font-medium">
                                              {formatCurrency(
                                                court.pricePerHour
                                              )}
                                              /hr
                                            </td>
                                            <td className="px-3 py-3 text-muted-foreground">
                                              {court.availableSlots.length}{" "}
                                              slots
                                            </td>
                                            <td className="px-3 py-3">
                                              <CourtStatusBadge
                                                status={court.status}
                                              />
                                            </td>
                                            <td className="px-3 py-3">
                                              <div className="flex justify-end gap-2">
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleToggleCourtStatus(
                                                      gym.id,
                                                      court
                                                    )
                                                  }
                                                >
                                                  {court.status === "available"
                                                    ? "Maintenance"
                                                    : "Available"}
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon-sm"
                                                  aria-label={`Edit ${court.name}`}
                                                  onClick={() => {
                                                    setActiveGymId(gym.id)
                                                    setEditingCourt(court)
                                                    setConfirmingRemoveCourtId(
                                                      null
                                                    )
                                                    setCourtFormOpen(true)
                                                  }}
                                                >
                                                  <Pencil
                                                    className="size-4"
                                                    aria-hidden="true"
                                                  />
                                                </Button>
                                                {confirmingRemoveCourtId ===
                                                getCourtActionId(
                                                  gym.id,
                                                  court.id
                                                ) ? (
                                                  <>
                                                    <Button
                                                      type="button"
                                                      variant="destructive"
                                                      size="sm"
                                                      disabled={
                                                        deletingCourtId ===
                                                        getCourtActionId(
                                                          gym.id,
                                                          court.id
                                                        )
                                                      }
                                                      onClick={() =>
                                                        handleRemoveCourt(
                                                          gym.id,
                                                          court
                                                        )
                                                      }
                                                    >
                                                      {deletingCourtId ===
                                                      getCourtActionId(
                                                        gym.id,
                                                        court.id
                                                      ) ? (
                                                        <Loader2
                                                          className="size-4 animate-spin"
                                                          aria-hidden="true"
                                                        />
                                                      ) : null}
                                                      Confirm delete
                                                    </Button>
                                                    <Button
                                                      type="button"
                                                      variant="outline"
                                                      size="sm"
                                                      disabled={
                                                        deletingCourtId ===
                                                        getCourtActionId(
                                                          gym.id,
                                                          court.id
                                                        )
                                                      }
                                                      onClick={() =>
                                                        setConfirmingRemoveCourtId(
                                                          null
                                                        )
                                                      }
                                                    >
                                                      Cancel
                                                    </Button>
                                                  </>
                                                ) : (
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Remove ${court.name}`}
                                                    title={`Delete ${court.name}`}
                                                    onClick={() =>
                                                      setConfirmingRemoveCourtId(
                                                        getCourtActionId(
                                                          gym.id,
                                                          court.id
                                                        )
                                                      )
                                                    }
                                                  >
                                                    <Trash2
                                                      className="size-4"
                                                      aria-hidden="true"
                                                    />
                                                  </Button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
      )}

      <CourtFormSheet
        court={editingCourt}
        open={courtFormOpen}
        onOpenChange={setCourtFormOpen}
        onSave={handleSaveCourt}
      />
    </div>
  )
}
