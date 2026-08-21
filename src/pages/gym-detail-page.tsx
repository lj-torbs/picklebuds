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
  QrCode,
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

type BookingScope = "court" | "whole_gym"

type CourtBookingSelection = {
  courtId: string
  date: string
  slots: string[]
}

type WholeGymBookingSelection = {
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

function getOpenPlayPricePerPlayer(court: Court) {
  if (!court.openPlayCapacity || court.openPlayCapacity <= 0) {
    return court.pricePerHour
  }

  return court.pricePerHour / court.openPlayCapacity
}

export function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { gyms } = useGyms()
  const {
    addBooking,
    getOpenPlaySeatsTaken,
    isWholeGymBooked,
    isGymFullyBooked,
    isSlotBooked,
  } = useBookings()
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
  const [selectedBookingScope, setSelectedBookingScope] =
    useState<BookingScope>(() =>
      searchParams.get("scope") === "whole-gym" ? "whole_gym" : "court"
    )
  const [bookingSelections, setBookingSelections] = useState<
    CourtBookingSelection[]
  >([])
  const [wholeGymSelections, setWholeGymSelections] = useState<
    WholeGymBookingSelection[]
  >([])
  const [wholeGymParticipants, setWholeGymParticipants] = useState("16")
  const [selectedPaymentOptionIndex, setSelectedPaymentOptionIndex] = useState(0)
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
  const isOpenPlayCourt = selectedCourt?.bookingMode === "open-play"
  const paymentOptions = gym?.paymentOptions ?? []
  const paymentSetup = paymentOptions[selectedPaymentOptionIndex]
  const wholeGymSetup = gym?.wholeGymBooking
  const wholeGymBookingEnabled =
    wholeGymSetup?.enabled === true && selectedCourt?.bookingMode !== "open-play"
  const bookingScope: BookingScope =
    wholeGymBookingEnabled && selectedBookingScope === "whole_gym"
      ? "whole_gym"
      : "court"
  const isWholeGymScope = bookingScope === "whole_gym"

  const totalSelectedSlots = useMemo(
    () =>
      bookingSummary.reduce(
        (total, selection) => total + selection.slots.length,
        0
      ),
    [bookingSummary]
  )
  const totalWholeGymSlots = useMemo(
    () =>
      wholeGymSelections.reduce(
        (total, selection) => total + selection.slots.length,
        0
      ),
    [wholeGymSelections]
  )

  const receiptIsComplete =
    gcashReference.trim().length >= 6 &&
    gcashAccountName.trim().length > 0 &&
    receiptImageUrl.length > 0
  const wholeGymParticipantCount = Number(wholeGymParticipants)
  const wholeGymParticipantCountValid =
    Number.isFinite(wholeGymParticipantCount) && wholeGymParticipantCount > 0

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
    setSelectedBookingScope("court")
  }

  function handleBookingScopeChange(scope: BookingScope) {
    setSelectedBookingScope(scope)
  }

  function getCellState(day: string, time: string): AvailabilityCellState {
    if (!selectedCourt || !selectedCourt.availableSlots.includes(time)) {
      return "closed"
    }

    if (
      isWholeGymBooked(gym!.id, day, time)
    ) {
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

    if (selectedCourt.bookingMode === "open-play") {
      const seatsTaken = getOpenPlaySeatsTaken(gym!.id, selectedCourt.id, day, time)
      const seatsLeft = (selectedCourt.openPlayCapacity ?? 0) - seatsTaken
      return seatsLeft <= 0 ? "booked" : "available"
    }

    if (isSlotBooked(gym!.id, selectedCourt.id, day, time)) {
      return "booked"
    }

    return "available"
  }

  function getWholeGymCellState(day: string, time: string): AvailabilityCellState {
    if (!wholeGymSetup || !wholeGymSetup.availableSlots.includes(time)) {
      return "closed"
    }

    if (
      wholeGymSelections.some(
        (selection) =>
          selection.date === day && selection.slots.includes(time)
      )
    ) {
      return "selected"
    }

    if (isGymFullyBooked(gym!.id, day, time)) {
      return "booked"
    }

    return "available"
  }

  function getCellLabel(day: string, time: string, state: AvailabilityCellState) {
    if (!selectedCourt || selectedCourt.bookingMode !== "open-play") {
      return undefined
    }

    const openPlayCapacity = selectedCourt.openPlayCapacity ?? 0
    const seatsTaken = getOpenPlaySeatsTaken(gym!.id, selectedCourt.id, day, time)

    if (state === "closed") {
      return "—"
    }

    if (state === "selected") {
      return `${Math.min(openPlayCapacity, seatsTaken + 1)}/${openPlayCapacity}`
    }

    if (state === "booked") {
      return `${openPlayCapacity}/${openPlayCapacity}`
    }

    return `${seatsTaken}/${openPlayCapacity}`
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

  function handleWholeGymCellSelect(day: string, time: string) {
    if (!wholeGymSetup) {
      return
    }

    setWholeGymSelections((current) => {
      const existing = current.find((selection) => selection.date === day)

      if (!existing) {
        return [...current, { date: day, slots: [time] }]
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
    if (!gym || !paymentSetup || !receiptIsComplete) {
      return
    }

    const paymentReceipt: PaymentReceipt = {
      referenceNumber: gcashReference.trim(),
      accountName: gcashAccountName.trim(),
      fileName: receiptFileName,
      imageUrl: receiptImageUrl,
      uploadedAt: new Date().toISOString(),
    }

    if (isWholeGymScope) {
      if (
        !wholeGymSetup ||
        wholeGymSelections.length === 0 ||
        !wholeGymParticipantCountValid
      ) {
        return
      }

      wholeGymSelections.forEach((selection) => {
        const createdBooking = addBooking({
          gymId: gym.id,
          gym: gym.name,
          address: gym.address,
          courtId: "whole-gym",
          court: "Whole gym",
          date: selection.date,
          slots: selection.slots,
          status: "pending",
          bookingType: "whole_gym",
          participantCount: wholeGymParticipantCount,
          paymentReceipt,
          ownerName: user?.name ?? "Guest Player",
          ownerEmail: user?.email ?? "guest@example.com",
        })

        addTransaction({
          id: createdBooking.id,
          customerName: user?.name ?? "Guest Player",
          customerEmail: user?.email ?? "guest@example.com",
          gymId: gym.id,
          gym: gym.name,
          courtId: "whole-gym",
          court: "Whole gym",
          date: selection.date,
          slots: selection.slots,
          bookingType: "whole_gym",
          participantCount: wholeGymParticipantCount,
          amount: wholeGymSetup.pricePerHour * selection.slots.length,
          paymentMethod: `${paymentSetup.provider} - ${paymentSetup.accountNumber}`,
          paymentStatus: "unpaid",
          status: "pending",
          paymentReceipt,
        })
      })
    } else {
      if (bookingSummary.length === 0) {
        return
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
          bookingType:
            selection.court.bookingMode === "open-play"
              ? "open_play"
              : "private",
          participantCount: 1,
          paymentReceipt,
          ownerName: user?.name ?? "Guest Player",
          ownerEmail: user?.email ?? "guest@example.com",
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
          bookingType:
            selection.court.bookingMode === "open-play" ? "open_play" : "private",
          participantCount: 1,
          amount:
            (selection.court.bookingMode === "open-play"
              ? getOpenPlayPricePerPlayer(selection.court)
              : selection.court.pricePerHour) * selection.slots.length,
          paymentMethod: `${paymentSetup.provider} - ${paymentSetup.accountNumber}`,
          paymentStatus: "unpaid",
          status: "pending",
          paymentReceipt,
        })
      })
    }
    toast.add({
      title: "Receipt submitted",
      description: `${isWholeGymScope ? totalWholeGymSlots : totalSelectedSlots} slot${(isWholeGymScope ? totalWholeGymSlots : totalSelectedSlots) === 1 ? "" : "s"} pending owner verification at ${gym.name}.`,
      type: "success",
    })
    navigate("/my-bookings")
  }

  const courtEstimatedTotal = bookingSummary.reduce(
    (total, selection) =>
      total +
      (selection.court.bookingMode === "open-play"
        ? getOpenPlayPricePerPlayer(selection.court)
        : selection.court.pricePerHour) *
        selection.slots.length,
    0
  )
  const wholeGymEstimatedTotal =
    (wholeGymSetup?.pricePerHour ?? 0) * totalWholeGymSlots
  const estimatedTotal = isWholeGymScope
    ? wholeGymEstimatedTotal
    : courtEstimatedTotal

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
                    <div>
                      <p className="text-sm font-medium text-primary">
                        Booking option
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight">
                        Choose your booking type
                      </h2>
                    </div>
                  {wholeGymBookingEnabled ? (
                    <p className="text-sm text-muted-foreground">
                      Whole gym rental blocks all courts for the selected slot.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleBookingScopeChange("court")}
                    className={cn(
                      "min-w-56 rounded-lg border p-4 text-left transition",
                      !isWholeGymScope
                        ? "border-primary bg-primary/5 ring-3 ring-primary/20"
                        : "bg-card hover:border-primary/50"
                    )}
                    >
                      <div className="font-medium">Court booking</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Reserve a court through the standard booking flow.
                      </p>
                    </button>
                  {wholeGymBookingEnabled ? (
                    <button
                      type="button"
                      onClick={() => handleBookingScopeChange("whole_gym")}
                      className={cn(
                        "min-w-56 rounded-lg border p-4 text-left transition",
                        isWholeGymScope
                          ? "border-primary bg-primary/5 ring-3 ring-primary/20"
                          : "bg-card hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium">Book the whole gym</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Exclusive venue rental for organizations, events, or private groups.
                      </p>
                    </button>
                  ) : null}
                </div>
              </section>

              {!isWholeGymScope ? (
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
                            <div className="grid gap-1">
                              <h3 className="leading-tight font-semibold">
                                {court.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <CourtStatusBadge status={court.status} />
                                <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                                  {court.bookingMode === "open-play"
                                    ? "Open Play"
                                    : "Private court"}
                                </span>
                              </div>
                            </div>
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
                              {court.bookingMode === "open-play" &&
                              court.openPlayCapacity
                                ? `${court.openPlayCapacity} players max`
                                : court.capacity}
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
                              {court.bookingMode === "open-play" &&
                              court.openPlayCapacity ? (
                                <>
                                  ${getOpenPlayPricePerPlayer(court).toFixed(2)}
                                  <span className="font-normal text-muted-foreground">
                                    /player
                                  </span>
                                </>
                              ) : (
                                <>
                                  ${court.pricePerHour}
                                  <span className="font-normal text-muted-foreground">
                                    /hr
                                  </span>
                                </>
                              )}
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
              ) : (
                <section className="grid gap-4 rounded-lg border bg-background p-4 shadow-xs sm:p-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        1
                      </span>
                      <div>
                        <p className="text-sm font-medium text-primary">
                          Whole gym rental
                        </p>
                        <h2 className="text-xl font-semibold tracking-tight">
                          Exclusive access to {gym.name}
                        </h2>
                      </div>
                    </div>
                    {wholeGymSetup ? (
                      <p className="text-sm font-medium text-primary">
                        ${wholeGymSetup.pricePerHour}/hr
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-4" aria-hidden="true" />
                        {gym.courts.length} courts included
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-4" aria-hidden="true" />
                        {wholeGymSetup?.availableSlots.length ?? 0} rental slots
                      </span>
                    </div>
                    {wholeGymSetup?.notes ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {wholeGymSetup.notes}
                      </p>
                    ) : null}
                  </div>
                </section>
              )}

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
                        {isWholeGymScope
                          ? "Whole gym schedule"
                          : selectedCourt?.bookingMode === "open-play"
                          ? `${selectedCourt?.name ?? "Court"} Open Play seats`
                          : `${selectedCourt?.name ?? "Court"} schedule`}
                      </h2>
                    </div>
                  </div>
                  <AvailabilityCalendarLegend />
                </div>
                {isWholeGymScope && wholeGymSetup ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                    Whole gym booking on Friday, August 21, 2026 onward is exclusive.
                    If any court or Open Play session already exists on a slot, that slot is blocked here.
                  </div>
                ) : null}
                {!isWholeGymScope && isOpenPlayCourt && selectedCourt?.openPlayCapacity ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                    Open Play on this court allows up to {selectedCourt.openPlayCapacity} players per session.
                    Each player pays ${getOpenPlayPricePerPlayer(selectedCourt).toFixed(2)} per slot.
                    Session tiles show booked players as `current/capacity`, and once you select a slot the count updates to include your seat.
                  </div>
                ) : null}
                {isWholeGymScope && wholeGymSetup ? (
                  <AvailabilityCalendar
                    days={week}
                    times={wholeGymSetup.availableSlots}
                    getState={getWholeGymCellState}
                    onSelect={gym.status === "active" ? handleWholeGymCellSelect : undefined}
                  />
                ) : selectedCourt ? (
                  <AvailabilityCalendar
                    days={week}
                    times={selectedCourt.availableSlots}
                    getState={getCellState}
                    getLabel={getCellLabel}
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
                        Booking type
                      </span>
                      <span className="font-medium">
                        {isWholeGymScope
                          ? "Whole gym"
                          : selectedCourt?.bookingMode === "open-play"
                            ? "Open Play"
                            : "Private court"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">
                        {isWholeGymScope ? "Coverage" : "Active court"}
                      </span>
                      <span className="font-medium">
                        {isWholeGymScope
                          ? `All ${gym.courts.length} courts`
                          : selectedCourt?.name ?? "-"}
                      </span>
                    </div>
                    {selectedCourt?.bookingMode === "open-play" &&
                    selectedCourt.openPlayCapacity ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground">
                          Open Play seat price
                        </span>
                        <span className="font-medium">
                          ${getOpenPlayPricePerPlayer(selectedCourt).toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                    {isWholeGymScope && wholeGymSetup ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground">
                          Whole gym rate
                        </span>
                        <span className="font-medium">
                          ${wholeGymSetup.pricePerHour}/hr
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {isWholeGymScope
                          ? "Selected whole gym slots"
                          : isOpenPlayCourt
                          ? "Selected Open Play sessions"
                          : "Selected courts and times"}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {isWholeGymScope ? totalWholeGymSlots : totalSelectedSlots}{" "}
                        slot
                        {(isWholeGymScope
                          ? totalWholeGymSlots
                          : totalSelectedSlots) === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>
                    {isWholeGymScope ? (
                      wholeGymSelections.length > 0 ? (
                        <div className="mt-2 grid gap-2">
                          {wholeGymSelections.map((selection) => (
                            <div
                              key={`whole-gym-${selection.date}`}
                              className="rounded-md bg-background p-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">Whole gym</span>
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
                          No whole gym slots selected
                        </span>
                      )
                    ) : bookingSummary.length > 0 ? (
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
                            {selection.court.bookingMode === "open-play" &&
                            selection.court.openPlayCapacity ? (
                              <p className="mt-1 text-xs text-primary">
                                1 seat at $
                                {getOpenPlayPricePerPlayer(selection.court).toFixed(
                                  2
                                )}{" "}
                                per slot · projected occupancy updates in the calendar
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="mt-1 block font-medium">
                        No slots selected
                      </span>
                    )}
                  </div>
                  {isWholeGymScope ? (
                    <div className="grid gap-2 rounded-lg border p-3">
                      <Label htmlFor="whole-gym-participants">
                        Expected number of players
                      </Label>
                      <Input
                        id="whole-gym-participants"
                        type="number"
                        min="1"
                        step="1"
                        value={wholeGymParticipants}
                        onChange={(event) =>
                          setWholeGymParticipants(event.target.value)
                        }
                        placeholder="e.g. 20"
                      />
                      <p className="text-xs text-muted-foreground">
                        This helps the owner understand the scale of the private organization booking.
                      </p>
                    </div>
                  ) : null}
                  <div className="grid gap-3 rounded-lg border p-3">
                    <div>
                      <h3 className="text-sm font-medium">Venue payment methods</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pick the best payment option for you, send the payment,
                        then upload your receipt for owner confirmation.
                      </p>
                    </div>
                    {paymentSetup ? (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="payment-method">Select payment method</Label>
                          <select
                            id="payment-method"
                            value={String(selectedPaymentOptionIndex)}
                            onChange={(event) =>
                              setSelectedPaymentOptionIndex(Number(event.target.value))
                            }
                            className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            {paymentOptions.map((option, index) => (
                              <option key={`${option.provider}-${option.accountNumber}-${index}`} value={index}>
                                {option.provider} - {option.accountNumber}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                          <div className="grid gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <QrCode className="size-3.5" aria-hidden="true" />
                              {paymentSetup.provider}
                            </span>
                            <span className="font-medium">
                              {paymentSetup.accountName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {paymentSetup.accountNumber}
                            </span>
                          </div>
                          <img
                            src={paymentSetup.qrCodeImageUrl}
                            alt={`${paymentSetup.provider} QR code for ${gym.name}`}
                            className="mx-auto aspect-square w-full max-w-56 rounded-lg border bg-white object-contain p-3"
                          />
                          {paymentSetup.instructions ? (
                            <p className="text-xs text-muted-foreground">
                              {paymentSetup.instructions}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="payment-reference">
                            Payment reference number
                          </Label>
                          <Input
                            id="payment-reference"
                            value={gcashReference}
                            onChange={(event) =>
                              setGcashReference(event.target.value)
                            }
                            placeholder="e.g. 1002 345 678901"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="payment-account-name">
                            Sender account name
                          </Label>
                          <Input
                            id="payment-account-name"
                            value={gcashAccountName}
                            onChange={(event) =>
                              setGcashAccountName(event.target.value)
                            }
                            placeholder="Name shown on the receipt"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="payment-receipt">Receipt screenshot</Label>
                          <Input
                            id="payment-receipt"
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
                      </>
                    ) : (
                      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-300">
                        This venue has not configured any payment methods yet. Booking
                        submission is disabled until the owner sets one up.
                      </div>
                    )}
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
                      {isWholeGymScope
                        ? `${totalWholeGymSlots} whole gym slot${totalWholeGymSlots === 1 ? "" : "s"} for ${wholeGymParticipantCountValid ? wholeGymParticipantCount : 0} player${wholeGymParticipantCount === 1 ? "" : "s"}`
                        : isOpenPlayCourt
                        ? `${totalSelectedSlots} Open Play seat${totalSelectedSlots === 1 ? "" : "s"} selected`
                        : `${totalSelectedSlots} slot${totalSelectedSlots === 1 ? "" : "s"} across ${bookingSummary.length} court/date${bookingSummary.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleConfirmBooking}
                    disabled={
                      (isWholeGymScope
                        ? totalWholeGymSlots === 0 || !wholeGymParticipantCountValid
                        : totalSelectedSlots === 0) ||
                      gym.status !== "active" ||
                      !paymentSetup ||
                      !receiptIsComplete
                    }
                  >
                    <CalendarCheck className="size-4" aria-hidden="true" />
                    {isWholeGymScope
                      ? "Submit whole gym request"
                      : isOpenPlayCourt
                        ? "Join Open Play"
                        : "Submit payment proof"}
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
