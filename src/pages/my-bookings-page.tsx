import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Bell,
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
import { useToast } from "@/components/ui/toast"
import type { Booking, BookingStatus } from "@/lib/bookings-context"
import { useBookings } from "@/lib/bookings-context"
import { cn } from "@/lib/utils"

const rescheduleSlots = ["7:30 AM", "9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM", "6:00 PM"]

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-primary/15 text-primary",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

export function MyBookingsPage() {
  const {
    bookings,
    cancelBooking: cancelBookingInStore,
    rescheduleBooking: rescheduleBookingInStore,
  } = useBookings()
  const toast = useToast()
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const [draftDate, setDraftDate] = useState("")
  const [draftSlots, setDraftSlots] = useState<string[]>([])

  const upcomingBookings = bookings.filter(
    (booking) => booking.status !== "completed" && booking.status !== "cancelled"
  )
  const completedBookings = bookings.filter((booking) => booking.status === "completed")
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

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

  function cancelBooking(bookingId: string) {
    cancelBookingInStore(bookingId)
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
              <span className="block text-base font-bold leading-tight">PickleBuddy</span>
              <span className="block text-xs text-muted-foreground">My bookings</span>
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
            <p className="text-sm font-medium text-primary">Reservation history</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              My bookings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review upcoming court reservations, check selected time slots, or create a new booking.
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
                  onCancel={() => cancelBooking(booking.id)}
                  onEdit={() => startReschedule(booking)}
                  onDraftDateChange={setDraftDate}
                  onDraftSlotToggle={toggleDraftSlot}
                  onSave={() => saveReschedule(booking.id)}
                  onStopEditing={() => setEditingBookingId(null)}
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
              <CardDescription>Your current frontend sample reservations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">Upcoming</span>
                  <span className="mt-1 block text-2xl font-semibold">
                    {upcomingBookings.length}
                  </span>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">Completed</span>
                  <span className="mt-1 block text-2xl font-semibold">
                    {completedBookings.length}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <span className="block text-xs text-muted-foreground">Cancelled</span>
                <span className="mt-1 block text-2xl font-semibold">
                  {cancelledBookings.length}
                </span>
              </div>
              <Link to="/booking" className={buttonVariants({ className: "w-full" })}>
                <CalendarDays className="size-4" aria-hidden="true" />
                Book another court
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
  draftDate = "",
  draftSlots = [],
  onCancel,
  onEdit,
  onDraftDateChange,
  onDraftSlotToggle,
  onSave,
  onStopEditing,
}: {
  booking: Booking
  compact?: boolean
  isEditing?: boolean
  draftDate?: string
  draftSlots?: string[]
  onCancel?: () => void
  onEdit?: () => void
  onDraftDateChange?: (date: string) => void
  onDraftSlotToggle?: (slot: string) => void
  onSave?: () => void
  onStopEditing?: () => void
}) {
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
            <span className="text-muted-foreground">Court:</span>{" "}
            <span className="font-medium">{booking.court}</span>
          </p>
        </div>

        {!compact ? (
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Reschedule
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={onCancel}>
              <XCircle className="size-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-4 grid gap-4 rounded-lg bg-muted p-4">
          <div className="grid gap-2 sm:max-w-xs">
            <span className="text-sm font-medium">New date</span>
            <DatePicker value={draftDate} onChange={(date) => onDraftDateChange?.(date)} />
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
            <Button type="button" size="sm" onClick={onSave} disabled={draftSlots.length === 0}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Save changes
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onStopEditing}>
              Keep current booking
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
