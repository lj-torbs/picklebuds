import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Bell,
  BadgeDollarSign,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  RotateCcw,
  UserRound,
  XCircle,
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
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import type {
  Booking,
  BookingStatus,
  PasaloStatus,
} from "@/lib/bookings-context"
import { useBookings } from "@/lib/bookings-context"
import { cn } from "@/lib/utils"

const rescheduleSlots = [
  "7:30 AM",
  "9:00 AM",
  "10:30 AM",
  "1:00 PM",
  "3:30 PM",
  "6:00 PM",
]

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-primary/15 text-primary",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

const pasaloStatusStyles: Record<PasaloStatus, string> = {
  none: "bg-muted text-muted-foreground",
  open: "bg-primary/15 text-primary",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-destructive/10 text-destructive",
}

export function MyBookingsPage() {
  const {
    bookings,
    cancelBooking: cancelBookingInStore,
    rescheduleBooking: rescheduleBookingInStore,
    offerPasalo,
    cancelPasaloOffer,
  } = useBookings()
  const toast = useToast()
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const [draftDate, setDraftDate] = useState("")
  const [draftSlots, setDraftSlots] = useState<string[]>([])
  const [cancelCandidateId, setCancelCandidateId] = useState<string | null>(
    null
  )
  const [pasaloBookingId, setPasaloBookingId] = useState<string | null>(null)
  const [pasaloPrice, setPasaloPrice] = useState("")
  const [pasaloNote, setPasaloNote] = useState("")

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status !== "completed" && booking.status !== "cancelled"
  )
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  )
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  )

  function startReschedule(booking: Booking) {
    setEditingBookingId(booking.id)
    setDraftDate(booking.date)
    setDraftSlots(booking.slots)
  }

  function toggleDraftSlot(slot: string) {
    setDraftSlots((currentSlots) => {
      if (currentSlots.includes(slot)) {
        return currentSlots.filter((currentSlot) => currentSlot !== slot)
      }

      return [...currentSlots, slot]
    })
  }

  function saveReschedule(bookingId: string) {
    if (draftSlots.length === 0) {
      return
    }

    rescheduleBookingInStore(bookingId, draftDate, draftSlots)
    setEditingBookingId(null)
    toast.add({
      title: "Booking rescheduled",
      description: `Updated to ${draftDate} · ${draftSlots.join(", ")}`,
      type: "success",
    })
  }

  function startPasaloOffer(booking: Booking) {
    setPasaloBookingId(booking.id)
    setPasaloPrice(String(Math.max(1, booking.slots.length * 12)))
    setPasaloNote(booking.pasalo?.note ?? "")
    setEditingBookingId(null)
  }

  function savePasaloOffer(booking: Booking) {
    const askingPrice = Number(pasaloPrice)

    if (!Number.isFinite(askingPrice) || askingPrice <= 0) {
      return
    }

    offerPasalo(booking.id, askingPrice, pasaloNote.trim() || undefined)
    setPasaloBookingId(null)
    toast.add({
      title: "Pasalo offer posted",
      description: `${booking.id} is now visible on the Pasalo board.`,
      type: "success",
    })
  }

  function cancelPasalo(booking: Booking) {
    cancelPasaloOffer(booking.id)
    setPasaloBookingId(null)
    toast.add({
      title: "Pasalo offer cancelled",
      description: `${booking.id} is no longer listed for transfer.`,
      type: "success",
    })
  }

  function requestCancel(bookingId: string) {
    setCancelCandidateId(bookingId)
  }

  function dismissCancel() {
    setCancelCandidateId(null)
  }

  function confirmCancel(bookingId: string) {
    cancelBookingInStore(bookingId)
    setCancelCandidateId(null)
    if (editingBookingId === bookingId) {
      setEditingBookingId(null)
    }
    toast.add({
      title: "Booking cancelled",
      description: `Booking ${bookingId} has been cancelled.`,
      type: "success",
    })
  }

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
                My bookings
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
            <Link to="/booking" className={buttonVariants({ size: "sm" })}>
              <Plus className="size-4" aria-hidden="true" />
              New booking
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <div>
            <p className="text-sm font-medium text-primary">
              Reservation history
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              My bookings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review upcoming court reservations, check selected time slots, or
              create a new booking.
            </p>
          </div>
          <section className="grid gap-3">
            <h2 className="text-base font-semibold">Upcoming</h2>
            <div className="grid gap-3">
              {upcomingBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  isEditing={editingBookingId === booking.id}
                  draftDate={draftDate}
                  draftSlots={draftSlots}
                  isConfirmingCancel={cancelCandidateId === booking.id}
                  isOfferingPasalo={pasaloBookingId === booking.id}
                  pasaloPrice={pasaloPrice}
                  pasaloNote={pasaloNote}
                  onRequestCancel={() => requestCancel(booking.id)}
                  onConfirmCancel={() => confirmCancel(booking.id)}
                  onDismissCancel={dismissCancel}
                  onEdit={() => startReschedule(booking)}
                  onStartPasalo={() => startPasaloOffer(booking)}
                  onSavePasalo={() => savePasaloOffer(booking)}
                  onCancelPasalo={() => cancelPasalo(booking)}
                  onPasaloPriceChange={setPasaloPrice}
                  onPasaloNoteChange={setPasaloNote}
                  onDraftDateChange={setDraftDate}
                  onDraftSlotToggle={toggleDraftSlot}
                  onSave={() => saveReschedule(booking.id)}
                  onStopEditing={() => setEditingBookingId(null)}
                  onStopPasalo={() => setPasaloBookingId(null)}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-3">
            <h2 className="text-base font-semibold">Completed</h2>
            <div className="grid gap-3">
              {completedBookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} compact />
              ))}
            </div>
          </section>

          {cancelledBookings.length > 0 ? (
            <section className="grid gap-3">
              <h2 className="text-base font-semibold">Cancelled</h2>
              <div className="grid gap-3">
                {cancelledBookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} compact />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Booking overview</CardTitle>
              <CardDescription>
                Your current frontend sample reservations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">
                    Upcoming
                  </span>
                  <span className="mt-1 block text-2xl font-semibold">
                    {upcomingBookings.length}
                  </span>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">
                    Completed
                  </span>
                  <span className="mt-1 block text-2xl font-semibold">
                    {completedBookings.length}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <span className="block text-xs text-muted-foreground">
                  Cancelled
                </span>
                <span className="mt-1 block text-2xl font-semibold">
                  {cancelledBookings.length}
                </span>
              </div>
              <Link
                to="/booking"
                className={buttonVariants({ className: "w-full" })}
              >
                <CalendarDays className="size-4" aria-hidden="true" />
                Book another court
              </Link>
              <Link
                to="/pasalo"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full",
                })}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                View Pasalo board
              </Link>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}

function BookingRow({
  booking,
  compact = false,
  isEditing = false,
  isOfferingPasalo = false,
  draftDate = "",
  draftSlots = [],
  pasaloPrice = "",
  pasaloNote = "",
  isConfirmingCancel = false,
  onRequestCancel,
  onConfirmCancel,
  onDismissCancel,
  onEdit,
  onStartPasalo,
  onSavePasalo,
  onCancelPasalo,
  onPasaloPriceChange,
  onPasaloNoteChange,
  onDraftDateChange,
  onDraftSlotToggle,
  onSave,
  onStopEditing,
  onStopPasalo,
}: {
  booking: Booking
  compact?: boolean
  isEditing?: boolean
  isOfferingPasalo?: boolean
  draftDate?: string
  draftSlots?: string[]
  pasaloPrice?: string
  pasaloNote?: string
  isConfirmingCancel?: boolean
  onRequestCancel?: () => void
  onConfirmCancel?: () => void
  onDismissCancel?: () => void
  onEdit?: () => void
  onStartPasalo?: () => void
  onSavePasalo?: () => void
  onCancelPasalo?: () => void
  onPasaloPriceChange?: (value: string) => void
  onPasaloNoteChange?: (value: string) => void
  onDraftDateChange?: (date: string) => void
  onDraftSlotToggle?: (slot: string) => void
  onSave?: () => void
  onStopEditing?: () => void
  onStopPasalo?: () => void
}) {
  const pasaloStatus = booking.pasalo?.status ?? "none"
  const canOfferPasalo =
    booking.bookingType === "private" &&
    booking.status === "confirmed" &&
    (pasaloStatus === "none" || pasaloStatus === "cancelled")

  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{booking.gym}</span>
            <span
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium capitalize",
                statusStyles[booking.status]
              )}
            >
              {booking.status}
            </span>
            {pasaloStatus !== "none" ? (
              <span
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium capitalize",
                  pasaloStatusStyles[pasaloStatus]
                )}
              >
                Pasalo {pasaloStatus}
              </span>
            ) : null}
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {booking.bookingType === "open_play"
                ? "Open Play"
                : booking.bookingType === "whole_gym"
                  ? "Whole Gym"
                  : "Private"}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {booking.address}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {booking.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" />
              {booking.slots.join(", ")}
            </span>
          </div>
          <p className="text-sm">
            <span className="text-muted-foreground">
              {booking.bookingType === "whole_gym" ? "Coverage:" : "Court:"}
            </span>{" "}
            <span className="font-medium">{booking.court}</span>
          </p>
          {booking.bookingType === "open_play" ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Seat count:</span>{" "}
              <span className="font-medium">{booking.participantCount}</span>
            </p>
          ) : booking.bookingType === "whole_gym" ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Expected players:</span>{" "}
              <span className="font-medium">{booking.participantCount}</span>
            </p>
          ) : null}
          {booking.ownerName || booking.ownerEmail ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Booked under:</span>{" "}
              <span className="font-medium">
                {booking.ownerName ?? booking.ownerEmail}
              </span>
            </p>
          ) : null}
          {booking.pasalo?.askingPrice ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <BadgeDollarSign className="size-4" aria-hidden="true" />
              Pasalo asking price:{" "}
              <span className="font-medium text-foreground">
                ${booking.pasalo.askingPrice}
              </span>
            </p>
          ) : null}
        </div>

        {!compact ? (
          isConfirmingCancel ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Cancel this booking?
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onConfirmCancel}
              >
                Yes, cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDismissCancel}
              >
                No, keep it
              </Button>
            </div>
          ) : (
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={pasaloStatus === "open" || pasaloStatus === "pending"}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reschedule
              </Button>
              {pasaloStatus === "open" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancelPasalo}
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Cancel Pasalo
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onStartPasalo}
                  disabled={!canOfferPasalo}
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Offer as Pasalo
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRequestCancel}
                disabled={pasaloStatus === "pending"}
              >
                <XCircle className="size-4" aria-hidden="true" />
                Cancel
              </Button>
            </div>
          )
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-4 grid gap-4 rounded-lg bg-muted p-4">
          <div className="grid gap-2 sm:max-w-xs">
            <span className="text-sm font-medium">New date</span>
            <DatePicker
              value={draftDate}
              onChange={(date) => onDraftDateChange?.(date)}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">New time slots</span>
            <div className="flex flex-wrap gap-2">
              {rescheduleSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={draftSlots.includes(slot) ? "default" : "outline"}
                  onClick={() => onDraftSlotToggle?.(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={draftSlots.length === 0}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStopEditing}
            >
              Keep current booking
            </Button>
          </div>
        </div>
      ) : null}

      {isOfferingPasalo ? (
        <div className="mt-4 grid gap-4 rounded-lg bg-muted p-4">
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor={`${booking.id}-pasalo-price`}>Asking price</Label>
            <Input
              id={`${booking.id}-pasalo-price`}
              type="number"
              min="1"
              value={pasaloPrice}
              onChange={(event) => onPasaloPriceChange?.(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${booking.id}-pasalo-note`}>Note to players</Label>
            <textarea
              id={`${booking.id}-pasalo-note`}
              value={pasaloNote}
              onChange={(event) => onPasaloNoteChange?.(event.target.value)}
              placeholder="Optional reason, meetup detail, or transfer note"
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onSavePasalo}
              disabled={Number(pasaloPrice) <= 0}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Post Pasalo offer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStopPasalo}
            >
              Keep booking
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
