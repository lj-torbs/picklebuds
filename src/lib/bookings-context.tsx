/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import {
  createMockPaymentReceipt,
  type PaymentReceipt,
} from "@/shared/lib/payment-receipt"
import type { BookingRental } from "@/shared/lib/gyms-context"

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled"
export type PasaloStatus = "none" | "open" | "pending" | "completed" | "cancelled"
export type BookingType = "private" | "open_play" | "whole_gym"

export type PasaloOffer = {
  status: PasaloStatus
  askingPrice: number
  note?: string
  offeredAt?: string
  claimedAt?: string
  claimantName?: string
  claimantEmail?: string
  transferReceipt?: PaymentReceipt
}

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
  bookingType: BookingType
  participantCount: number
  rentals?: BookingRental[]
  paymentReceipt?: PaymentReceipt
  ownerName?: string
  ownerEmail?: string
  pasalo?: PasaloOffer
}


type NewBooking = Omit<Booking, "id" | "status"> & { status?: BookingStatus }
type PasaloClaimInput = {
  claimantName: string
  claimantEmail: string
  transferReceipt: PaymentReceipt
}

type BookingsContextValue = {
  bookings: Booking[]
  addBooking: (booking: NewBooking) => Booking
  cancelBooking: (id: string) => void
  rescheduleBooking: (id: string, date: string, slots: string[]) => void
  setBookingStatus: (id: string, status: BookingStatus) => void
  offerPasalo: (id: string, askingPrice: number, note?: string) => void
  cancelPasaloOffer: (id: string) => void
  claimPasalo: (id: string, input: PasaloClaimInput) => void
  getOpenPlaySeatsTaken: (
    gymId: string,
    courtId: string,
    date: string,
    slot: string
  ) => number
  getRentedQuantity: (gymId: string, itemId: string, date: string) => number
  isWholeGymBooked: (gymId: string, date: string, slot: string) => boolean
  isGymFullyBooked: (gymId: string, date: string, slot: string) => boolean
  isSlotBooked: (
    gymId: string,
    courtId: string,
    date: string,
    slot: string
  ) => boolean
}

const initialBookings: Booking[] = [
  {
    id: "PB-1042",
    gymId: "northside",
    gym: "Tagum Pickleball Hub",
    address: "Pioneer Avenue, Magugpo Poblacion, Tagum City",
    courtId: "northside-b",
    court: "Court B",
    date: "2026-08-24",
    slots: ["10:00 AM", "2:30 PM"],
    status: "confirmed",
    bookingType: "private",
    participantCount: 1,
    ownerName: "Jordan Alcaraz",
    ownerEmail: "jordan.alcaraz@example.com",
  },
  {
    id: "PB-1043",
    gymId: "central",
    gym: "Mankilam Court Club",
    address: "Mankilam Road, Barangay Mankilam, Tagum City",
    courtId: "central-2",
    court: "Court 2",
    date: "2026-08-26",
    slots: ["5:00 PM", "8:00 PM"],
    status: "pending",
    bookingType: "private",
    participantCount: 1,
    ownerName: "Mika Santos",
    ownerEmail: "mika.santos@example.com",
    paymentReceipt: createMockPaymentReceipt({
      venue: "Mankilam Court Club",
      accountName: "Mika Santos",
      referenceNumber: "GCASH-20260820-1043",
      amount: 32,
      uploadedAt: "2026-08-20 10:18 PM",
    }),
  },
  {
    id: "PB-1019",
    gymId: "riverside",
    gym: "Apokon Rally Courts",
    address: "Apokon Road, Barangay Apokon, Tagum City",
    courtId: "riverside-main",
    court: "Main Court",
    date: "2026-08-14",
    slots: ["7:30 AM"],
    status: "completed",
    bookingType: "private",
    participantCount: 1,
    ownerName: "Leo Fontanilla",
    ownerEmail: "leo.fontanilla@example.com",
  },
  {
    id: "PB-1058",
    gymId: "visayan-village",
    gym: "Visayan Village Pickleball Center",
    address: "National Highway, Barangay Visayan Village, Tagum City",
    courtId: "visayan-village-1",
    court: "Court 1",
    date: "2026-08-24",
    slots: ["4:30 PM", "7:30 PM"],
    status: "confirmed",
    bookingType: "private",
    participantCount: 1,
    ownerName: "Ava Reyes",
    ownerEmail: "ava.reyes@example.com",
    pasalo: {
      status: "open",
      askingPrice: 24,
      note: "Selling both slots together because our doubles group had to cancel.",
      offeredAt: "2026-08-20T10:15:00Z",
    },
  },
  {
    id: "PB-1062",
    gymId: "canocotan",
    gym: "Canocotan Pickleball Arena",
    address: "Canocotan Road, Barangay Canocotan, Tagum City",
    courtId: "canocotan-2",
    court: "Arena Court 2",
    date: "2026-08-25",
    slots: ["8:00 PM"],
    status: "confirmed",
    bookingType: "private",
    participantCount: 1,
    ownerName: "Ethan Bautista",
    ownerEmail: "ethan.bautista@example.com",
    pasalo: {
      status: "open",
      askingPrice: 16,
      note: "Late evening slot available. Please send GCash proof after claiming.",
      offeredAt: "2026-08-20T14:30:00Z",
    },
  },
  {
    id: "PB-1066",
    gymId: "northside",
    gym: "Tagum Pickleball Hub",
    address: "Pioneer Avenue, Magugpo Poblacion, Tagum City",
    courtId: "whole-gym",
    court: "Whole gym",
    date: "2026-08-27",
    slots: ["4:00 PM", "7:00 PM"],
    status: "pending",
    bookingType: "whole_gym",
    participantCount: 24,
    ownerName: "Apex Systems Sports Club",
    ownerEmail: "events@apexsystems.example.com",
    paymentReceipt: createMockPaymentReceipt({
      venue: "Tagum Pickleball Hub",
      accountName: "Apex Systems Sports Club",
      referenceNumber: "BANK-20260821-1066",
      amount: 68,
      uploadedAt: "2026-08-21 05:18 PM",
    }),
  },
  {
    id: "PB-1063",
    gymId: "visayan-village",
    gym: "Visayan Village Pickleball Center",
    address: "National Highway, Barangay Visayan Village, Tagum City",
    courtId: "visayan-village-2",
    court: "Court 2",
    date: "2026-08-22",
    slots: ["6:00 PM"],
    status: "confirmed",
    bookingType: "open_play",
    participantCount: 5,
    ownerName: "Marcus Diaz",
    ownerEmail: "marcus.diaz@example.com",
  },
  {
    id: "PB-1064",
    gymId: "madaum",
    gym: "Madaum Pickleball Grounds",
    address: "Madaum Road, Barangay Madaum, Tagum City",
    courtId: "madaum-1",
    court: "Court 1",
    date: "2026-08-23",
    slots: ["5:30 PM"],
    status: "confirmed",
    bookingType: "open_play",
    participantCount: 3,
    ownerName: "Ava Reyes",
    ownerEmail: "ava.reyes@example.com",
  },
  {
    id: "PB-1065",
    gymId: "canocotan",
    gym: "Canocotan Pickleball Arena",
    address: "Canocotan Road, Barangay Canocotan, Tagum City",
    courtId: "canocotan-2",
    court: "Arena Court 2",
    date: "2026-08-24",
    slots: ["5:00 PM"],
    status: "pending",
    bookingType: "open_play",
    participantCount: 7,
    ownerName: "Ethan Bautista",
    ownerEmail: "ethan.bautista@example.com",
    paymentReceipt: createMockPaymentReceipt({
      venue: "Canocotan Pickleball Arena",
      accountName: "Ethan Bautista",
      referenceNumber: "GCASH-20260821-1065",
      amount: 10.5,
      uploadedAt: "2026-08-21 03:42 PM",
    }),
  },
]

const BookingsContext = React.createContext<BookingsContextValue | undefined>(
  undefined
)

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings)
  const nextIdRef = React.useRef(1067)

  const addBooking = React.useCallback((booking: NewBooking) => {
    const created: Booking = {
      ...booking,
      id: `PB-${nextIdRef.current++}`,
      status: booking.status ?? "confirmed",
      bookingType: booking.bookingType ?? "private",
      participantCount: booking.participantCount ?? 1,
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

  const rescheduleBooking = React.useCallback(
    (id: string, date: string, slots: string[]) => {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? { ...booking, date, slots, status: "confirmed" }
            : booking
        )
      )
    },
    []
  )

  const setBookingStatus = React.useCallback((id: string, status: BookingStatus) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    )
  }, [])

  const offerPasalo = React.useCallback(
    (id: string, askingPrice: number, note?: string) => {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? {
                ...booking,
                pasalo: {
                  status: "open",
                  askingPrice,
                  note,
                  offeredAt: new Date().toISOString(),
                },
              }
            : booking
        )
      )
    },
    []
  )

  const cancelPasaloOffer = React.useCallback((id: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              pasalo: booking.pasalo
                ? { ...booking.pasalo, status: "cancelled" }
                : undefined,
            }
          : booking
      )
    )
  }, [])

  const claimPasalo = React.useCallback(
    (id: string, input: PasaloClaimInput) => {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id && booking.pasalo?.status === "open"
            ? {
                ...booking,
                ownerName: input.claimantName,
                ownerEmail: input.claimantEmail,
                pasalo: {
                  ...booking.pasalo,
                  status: "pending",
                  claimedAt: new Date().toISOString(),
                  claimantName: input.claimantName,
                  claimantEmail: input.claimantEmail,
                  transferReceipt: input.transferReceipt,
                },
              }
            : booking
        )
      )
    },
    []
  )

  // Gear is stocked per venue, so the same item rented on one date is free
  // again the next. Counts across every booking at this gym on that date.
  const getRentedQuantity = React.useCallback(
    (gymId: string, itemId: string, date: string) =>
      bookings
        .filter(
          (booking) =>
            booking.gymId === gymId &&
            booking.date === date &&
            booking.status !== "cancelled"
        )
        .reduce(
          (total, booking) =>
            total +
            (booking.rentals ?? [])
              .filter((rental) => rental.itemId === itemId)
              .reduce((sum, rental) => sum + rental.quantity, 0),
          0
        ),
    [bookings]
  )

  const isWholeGymBooked = React.useCallback(
    (gymId: string, date: string, slot: string) =>
      bookings.some(
        (booking) =>
          booking.gymId === gymId &&
          booking.date === date &&
          booking.bookingType === "whole_gym" &&
          booking.status !== "cancelled" &&
          booking.slots.includes(slot)
      ),
    [bookings]
  )

  const isGymFullyBooked = React.useCallback(
    (gymId: string, date: string, slot: string) =>
      bookings.some(
        (booking) =>
          booking.gymId === gymId &&
          booking.date === date &&
          booking.status !== "cancelled" &&
          booking.slots.includes(slot)
      ),
    [bookings]
  )

  const isSlotBooked = React.useCallback(
    (gymId: string, courtId: string, date: string, slot: string) =>
      bookings.some(
        (booking) =>
          booking.gymId === gymId &&
          booking.date === date &&
          booking.status !== "cancelled" &&
          booking.slots.includes(slot) &&
          (isWholeGymBooked(gymId, date, slot) ||
            (booking.courtId === courtId &&
              booking.bookingType === "private" &&
              booking.pasalo?.status !== "open"))
      ),
    [bookings, isWholeGymBooked]
  )

  const getOpenPlaySeatsTaken = React.useCallback(
    (gymId: string, courtId: string, date: string, slot: string) =>
      bookings
        .filter(
          (booking) =>
            booking.gymId === gymId &&
            booking.courtId === courtId &&
            booking.date === date &&
            booking.bookingType === "open_play" &&
            booking.status !== "cancelled" &&
            booking.slots.includes(slot)
        )
        .reduce((total, booking) => total + booking.participantCount, 0),
    [bookings]
  )

  const value = React.useMemo(
    () => ({
      bookings,
      addBooking,
      cancelBooking,
      rescheduleBooking,
      setBookingStatus,
      offerPasalo,
      cancelPasaloOffer,
      claimPasalo,
      getOpenPlaySeatsTaken,
      getRentedQuantity,
      isWholeGymBooked,
      isGymFullyBooked,
      isSlotBooked,
    }),
    [
      bookings,
      addBooking,
      cancelBooking,
      rescheduleBooking,
      setBookingStatus,
      offerPasalo,
      cancelPasaloOffer,
      claimPasalo,
      getOpenPlaySeatsTaken,
      getRentedQuantity,
      isWholeGymBooked,
      isGymFullyBooked,
      isSlotBooked,
    ]
  )

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  const context = React.useContext(BookingsContext)

  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingsProvider")
  }

  return context
}
