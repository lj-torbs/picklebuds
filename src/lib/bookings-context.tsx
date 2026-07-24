/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled"

export type Booking = {
  id: string
  gymId: string
  gym: string
  address: string
  courtId: string
  court: string
  date: string
  slots: string[]
  status: BookingStatus
}

type NewBooking = Omit<Booking, "id" | "status"> & { status?: BookingStatus }

type BookingsContextValue = {
  bookings: Booking[]
  addBooking: (booking: NewBooking) => Booking
  cancelBooking: (id: string) => void
  rescheduleBooking: (id: string, date: string, slots: string[]) => void
  isSlotBooked: (gymId: string, courtId: string, date: string, slot: string) => boolean
}

const initialBookings: Booking[] = [
  {
    id: "PB-1042",
    gymId: "northside",
    gym: "Northside Pickleball Gym",
    address: "12 Greenway Avenue",
    courtId: "northside-b",
    court: "Court B",
    date: "2026-07-12",
    slots: ["10:00 AM", "2:30 PM"],
    status: "confirmed",
  },
  {
    id: "PB-1043",
    gymId: "central",
    gym: "Central Court Club",
    address: "204 Matchpoint Street",
    courtId: "central-2",
    court: "Court 2",
    date: "2026-07-15",
    slots: ["5:00 PM", "8:00 PM"],
    status: "pending",
  },
  {
    id: "PB-1019",
    gymId: "riverside",
    gym: "Riverside Sports Center",
    address: "88 Rally Road",
    courtId: "riverside-main",
    court: "Main Court",
    date: "2026-07-05",
    slots: ["7:30 AM"],
    status: "completed",
  },
]

const BookingsContext = React.createContext<BookingsContextValue | undefined>(undefined)

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings)
  const nextIdRef = React.useRef(1044)

  const addBooking = React.useCallback((booking: NewBooking) => {
    const created: Booking = {
      ...booking,
      id: `PB-${nextIdRef.current++}`,
      status: booking.status ?? "confirmed",
    }
    setBookings((current) => [created, ...current])
    return created
  }, [])

  const cancelBooking = React.useCallback((id: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" } : booking
      )
    )
  }, [])

  const rescheduleBooking = React.useCallback((id: string, date: string, slots: string[]) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, date, slots, status: "confirmed" } : booking
      )
    )
  }, [])

  const isSlotBooked = React.useCallback(
    (gymId: string, courtId: string, date: string, slot: string) =>
      bookings.some(
        (booking) =>
          booking.gymId === gymId &&
          booking.courtId === courtId &&
          booking.date === date &&
          booking.status !== "cancelled" &&
          booking.slots.includes(slot)
      ),
    [bookings]
  )

  const value = React.useMemo(
    () => ({ bookings, addBooking, cancelBooking, rescheduleBooking, isSlotBooked }),
    [bookings, addBooking, cancelBooking, rescheduleBooking, isSlotBooked]
  )

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
}

export function useBookings() {
  const context = React.useContext(BookingsContext)

  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingsProvider")
  }

  return context
}
