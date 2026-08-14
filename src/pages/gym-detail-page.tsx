import { useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Bell,
  Building2,
  CalendarCheck,
  Clock3,
  DollarSign,
  ImageUp,
  MapPin,
  Phone,
  UserRound,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/lib/auth-context"
import { useBookings } from "@/lib/bookings-context"
import { cn } from "@/lib/utils"
import {
  AvailabilityCalendar,
  AvailabilityCalendarLegend,
  type AvailabilityCellState,
} from "@/shared/components/availability-calendar"
import { GymPhoto } from "@/shared/components/gyms/gym-photo"
import {
  CourtStatusBadge,
  GymStatusBadge,
} from "@/shared/components/gyms/gym-status-badge"
import type { Court } from "@/shared/lib/gyms-context"
import { useGyms } from "@/shared/lib/gyms-context"
import type { PaymentReceipt } from "@/shared/lib/payment-receipt"
import { useTransactions } from "@/shared/lib/transactions-context"

const DAYS_IN_VIEW = 7

type CourtBookingSelection = {
  courtId: string
  date: string
  slots: string[]
}

function buildWeek(startingFrom = new Date()) {
  return Array.from({ length: DAYS_IN_VIEW }, (_, index) => {
    const date = new Date(startingFrom)
    date.setDate(date.getDate() + index)

    return {
      value: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      sublabel: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }
  })
}

export function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { gyms } = useGyms()
  const { addBooking, isSlotBooked } = useBookings()
  const { addTransaction } = useTransactions()
  const { user } = useAuth()
  const toast = useToast()

  const gym = useMemo(
    () => gyms.find((candidate) => candidate.id === gymId),
    [gyms, gymId]
  )

  const week = useMemo(() => buildWeek(), [])

  const [selectedCourtId, setSelectedCourtId] = useState<string | undefined>(
    () => searchParams.get("court") ?? gym?.courts[0]?.id
  )
  const [bookingSelections, setBookingSelections] = useState<
    CourtBookingSelection[]
  >([])
  const [gcashReference, setGcashReference] = useState("")
  const [gcashAccountName, setGcashAccountName] = useState("")
  const [receiptFileName, setReceiptFileName] = useState("")
  const [receiptImageUrl, setReceiptImageUrl] = useState("")

  const selectedCourt: Court | undefined = useMemo(
    () =>
      gym?.courts.find((court) => court.id === selectedCourtId) ??
      gym?.courts[0],
    [gym, selectedCourtId]
  )

  const bookingSummary = useMemo(
    () =>
      bookingSelections
        .map((selection) => {
          const court = gym?.courts.find(
            (candidate) => candidate.id === selection.courtId
          )

          return court ? { ...selection, court } : null
        })
        .filter(
          (selection): selection is CourtBookingSelection & { court: Court } =>
            selection !== null
        ),
    [bookingSelections, gym]
  )

  const totalSelectedSlots = useMemo(
    () =>
      bookingSummary.reduce(
        (total, selection) => total + selection.slots.length,
        0
      ),
    [bookingSummary]
  )

  const receiptIsComplete =
    gcashReference.trim().length >= 6 &&
    gcashAccountName.trim().length > 0 &&
    receiptImageUrl.length > 0

  function handleReceiptUpload(file: File | undefined) {
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Receipt must be an image",
        description:
          "Upload a screenshot or photo of the GCash payment receipt.",
        type: "error",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReceiptFileName(file.name)
        setReceiptImageUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleCourtChange(court: Court) {
    setSelectedCourtId(court.id)
  }

  function getCellState(day: string, time: string): AvailabilityCellState {
    if (!selectedCourt || !selectedCourt.availableSlots.includes(time)) {
      return "closed"
    }

    if (isSlotBooked(gym!.id, selectedCourt.id, day, time)) {
      return "booked"
    }

    if (
      bookingSelections.some(
        (selection) =>
          selection.courtId === selectedCourt.id &&
          selection.date === day &&
          selection.slots.includes(time)
      )
    ) {
      return "selected"
    }

    return "available"
  }

  function handleCellSelect(day: string, time: string) {
    if (!selectedCourt) {
      return
    }

    setBookingSelections((current) => {
      const existing = current.find(
        (selection) =>
          selection.courtId === selectedCourt.id && selection.date === day
      )

      if (!existing) {
        return [
          ...current,
          { courtId: selectedCourt.id, date: day, slots: [time] },
        ]
      }

      const nextSlots = existing.slots.includes(time)
        ? existing.slots.filter((slot) => slot !== time)
        : [...existing.slots, time]

      if (nextSlots.length === 0) {
        return current.filter((selection) => selection !== existing)
      }

      return current.map((selection) =>
        selection === existing ? { ...selection, slots: nextSlots } : selection
      )
    })
  }

  function handleConfirmBooking() {
    if (!gym || bookingSummary.length === 0 || !receiptIsComplete) {
      return
    }

    const paymentReceipt: PaymentReceipt = {
      referenceNumber: gcashReference.trim(),
      accountName: gcashAccountName.trim(),
      fileName: receiptFileName,
      imageUrl: receiptImageUrl,
      uploadedAt: new Date().toISOString(),
    }

    bookingSummary.forEach((selection) => {
      const createdBooking = addBooking({
        gymId: gym.id,
        gym: gym.name,
        address: gym.address,
        courtId: selection.court.id,
        court: selection.court.name,
        date: selection.date,
        slots: selection.slots,
        status: "pending",
        paymentReceipt,
      })

      addTransaction({
        id: createdBooking.id,
        customerName: user?.name ?? "Guest Player",
        customerEmail: user?.email ?? "guest@example.com",
        gymId: gym.id,
        gym: gym.name,
        courtId: selection.court.id,
        court: selection.court.name,
        date: selection.date,
        slots: selection.slots,
        amount: selection.court.pricePerHour * selection.slots.length,
        paymentMethod: "GCash manual receipt",
        paymentStatus: "unpaid",
        status: "pending",
        paymentReceipt,
      })
    })
    toast.add({
      title: "Receipt submitted",
      description: `${totalSelectedSlots} slot${totalSelectedSlots === 1 ? "" : "s"} pending owner verification at ${gym.name}.`,
      type: "success",
    })
    navigate("/my-bookings")
  }

  const estimatedTotal = bookingSummary.reduce(
    (total, selection) =>
      total + selection.court.pricePerHour * selection.slots.length,
    0
  )

  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base leading-tight font-bold">
                PickleBuddy
              </span>
              <span className="block text-xs text-muted-foreground">
                Client booking
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Notifications"
            >
              <Bell className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/profile"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Profile"
            >
              <UserRound className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/my-bookings"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              My bookings
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Link
          to="/booking"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>

        {!gym ? (
          <div className="mt-6 rounded-lg border bg-card p-8 text-center">
            <p className="font-medium">Gym not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This gym may have been removed or is no longer listed.
            </p>
            <Link
              to="/booking"
              className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
            >
              Browse gyms
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="grid gap-6">
              <section className="overflow-hidden rounded-lg border bg-card shadow-xs">
                <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                  <GymPhoto
                    src={gym.imageUrl}
                    alt={gym.name}
                    className="h-56 w-full border-b lg:h-full lg:min-h-80 lg:border-r lg:border-b-0"
                  />
                  <div className="grid content-between gap-6 p-5 sm:p-6">
                    <div className="grid gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <GymStatusBadge status={gym.status} />
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {gym.courts.length} court
                          {gym.courts.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div>
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                          {gym.name}
                        </h1>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="size-4" aria-hidden="true" />
                            {gym.address}
                          </span>
                          {gym.phone ? (
                            <span className="inline-flex items-center gap-2">
                              <Phone className="size-4" aria-hidden="true" />
                              {gym.phone}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-2">
                            <Building2 className="size-4" aria-hidden="true" />
                            Book indoor and outdoor pickleball courts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {gym.status === "inactive" ? (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-300">
                  This gym isn't currently accepting bookings.
                </div>
              ) : null}

              <section className="grid gap-4 rounded-lg border bg-background p-4 shadow-xs sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      1
                    </span>
                    <div>
                      <p className="text-sm font-medium text-primary">Courts</p>
                      <h2 className="text-xl font-semibold tracking-tight">
                        Choose where you want to play
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maintenance courts cannot be selected.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {gym.courts.map((court) => {
                    const isSelected = court.id === selectedCourt?.id
                    const selectedSlotCount = bookingSelections
                      .filter((selection) => selection.courtId === court.id)
                      .reduce(
                        (total, selection) => total + selection.slots.length,
                        0
                      )

                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => handleCourtChange(court)}
                        disabled={court.status === "maintenance"}
                        className={cn(
                          "overflow-hidden rounded-lg border bg-card text-left shadow-xs transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-xs",
                          isSelected &&
                            "border-primary bg-primary/5 ring-3 ring-primary/20"
                        )}
                      >
                        <GymPhoto
                          src={court.imageUrl}
                          alt={court.name}
                          className="h-28 w-full"
                        />
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="leading-tight font-semibold">
                              {court.name}
                            </h3>
                            <CourtStatusBadge status={court.status} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {court.surface}
                          </p>
                          <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <UsersRound
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              {court.capacity}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              {court.availableSlots.length} slots/day
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">
                              ${court.pricePerHour}
                              <span className="font-normal text-muted-foreground">
                                /hr
                              </span>
                            </p>
                            {isSelected ? (
                              <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                Selected
                              </span>
                            ) : selectedSlotCount > 0 ? (
                              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {selectedSlotCount} slot
                                {selectedSlotCount === 1 ? "" : "s"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="grid gap-3 rounded-lg border bg-background p-4 shadow-xs sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      2
                    </span>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        Availability
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight">
                        {selectedCourt?.name ?? "Court"} schedule
                      </h2>
                    </div>
                  </div>
                  <AvailabilityCalendarLegend />
                </div>
                {selectedCourt ? (
                  <AvailabilityCalendar
                    days={week}
                    times={selectedCourt.availableSlots}
                    getState={getCellState}
                    onSelect={
                      gym.status === "active" &&
                      selectedCourt.status === "available"
                        ? handleCellSelect
                        : undefined
                    }
                  />
                ) : (
                  <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                    This gym has no courts yet.
                  </p>
                )}
              </section>
            </div>

            <aside className="lg:sticky lg:top-20 lg:self-start">
              <Card className="rounded-lg border-primary/20 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      3
                    </span>
                    <div>
                      <CardTitle>Review & pay</CardTitle>
                      <CardDescription>
                        Confirm your schedule and submit payment.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Venue
                      </span>
                      <span className="mt-1 block font-medium">{gym.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {gym.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">
                        Active court
                      </span>
                      <span className="font-medium">
                        {selectedCourt?.name ?? "-"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Selected courts and times
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {totalSelectedSlots} slot
                        {totalSelectedSlots === 1 ? "" : "s"}
                      </span>
                    </div>
                    {bookingSummary.length > 0 ? (
                      <div className="mt-2 grid gap-2">
                        {bookingSummary.map((selection) => (
                          <div
                            key={`${selection.courtId}-${selection.date}`}
                            className="rounded-md bg-background p-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {selection.court.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {selection.date}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {selection.slots.join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="mt-1 block font-medium">
                        No slots selected
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3 rounded-lg border p-3">
                    <div>
                      <h3 className="text-sm font-medium">GCash receipt</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Required before the reservation is submitted for owner
                        verification.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gcash-reference">
                        GCash reference number
                      </Label>
                      <Input
                        id="gcash-reference"
                        value={gcashReference}
                        onChange={(event) =>
                          setGcashReference(event.target.value)
                        }
                        placeholder="e.g. 1002 345 678901"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gcash-account-name">
                        Sender account name
                      </Label>
                      <Input
                        id="gcash-account-name"
                        value={gcashAccountName}
                        onChange={(event) =>
                          setGcashAccountName(event.target.value)
                        }
                        placeholder="Name shown on the receipt"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gcash-receipt">Receipt image</Label>
                      <Input
                        id="gcash-receipt"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleReceiptUpload(event.target.files?.[0])
                        }
                      />
                      {receiptFileName ? (
                        <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                          <ImageUp className="size-4" aria-hidden="true" />
                          <span className="truncate">{receiptFileName}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-2 rounded-lg bg-primary/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        <DollarSign className="size-4" aria-hidden="true" />
                        Estimated total
                      </span>
                      <span className="text-xl font-semibold text-primary">
                        ${estimatedTotal}
                      </span>
                    </div>
                    <p className="text-xs text-primary/80">
                      {totalSelectedSlots} slot
                      {totalSelectedSlots === 1 ? "" : "s"} across{" "}
                      {bookingSummary.length} court/date
                      {bookingSummary.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleConfirmBooking}
                    disabled={
                      totalSelectedSlots === 0 ||
                      gym.status !== "active" ||
                      !receiptIsComplete
                    }
                  >
                    <CalendarCheck className="size-4" aria-hidden="true" />
                    Submit receipt and book
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
