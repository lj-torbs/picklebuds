/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { placeholderPhoto, placeholderQr } from "@/shared/lib/placeholder-image"

export type GymStatus = "active" | "inactive"
export type CourtStatus = "available" | "maintenance"
export type PaymentProvider = "GCash" | "Bank Transfer" | "Maya" | "Other"
export type BookingMode = "private" | "open-play"

export type GymPaymentSetup = {
  provider: PaymentProvider
  accountName: string
  accountNumber: string
  instructions?: string
  qrCodeImageUrl: string
  qrCodeFileName: string
}

export type WholeGymBookingSetup = {
  enabled: boolean
  pricePerHour: number
  availableSlots: string[]
  notes?: string
}

export type Court = {
  id: string
  name: string
  surface: string
  capacity: string
  pricePerHour: number
  status: CourtStatus
  bookingMode: BookingMode
  openPlayCapacity?: number
  availableSlots: string[]
  imageUrl?: string
}

export type Gym = {
  id: string
  ownerId: string
  name: string
  address: string
  phone: string
  status: GymStatus
  imageUrl?: string
  paymentOptions: GymPaymentSetup[]
  wholeGymBooking?: WholeGymBookingSetup
  courts: Court[]
}

export type NewGym = Omit<Gym, "id" | "courts" | "status"> & {
  status?: GymStatus
}
export type GymUpdate = Partial<Omit<Gym, "id" | "courts">>

export type NewCourt = Omit<Court, "id" | "status"> & { status?: CourtStatus }
export type CourtUpdate = Partial<Omit<Court, "id">>

type GymsContextValue = {
  gyms: Gym[]
  addGym: (gym: NewGym) => Gym
  updateGym: (id: string, update: GymUpdate) => void
  setGymStatus: (id: string, status: GymStatus) => void
  removeGym: (id: string) => void
  addCourt: (gymId: string, court: NewCourt) => void
  updateCourt: (gymId: string, courtId: string, update: CourtUpdate) => void
  setCourtStatus: (gymId: string, courtId: string, status: CourtStatus) => void
  removeCourt: (gymId: string, courtId: string) => void
}

const initialGyms: Gym[] = [
  {
    id: "northside",
    ownerId: "owner-1",
    name: "Tagum Pickleball Hub",
    address: "Pioneer Avenue, Magugpo Poblacion, Tagum City",
    phone: "(084) 218-2231",
    status: "active",
    imageUrl: placeholderPhoto("tagum-hub", 800, 500),
    paymentOptions: [
      {
        provider: "GCash",
        accountName: "Priya Nair",
        accountNumber: "09171234567",
        instructions: "Send the exact amount and upload a clear screenshot of the receipt.",
        qrCodeImageUrl: placeholderQr("Tagum Hub GCash"),
        qrCodeFileName: "tagum-hub-gcash-qr.png",
      },
      {
        provider: "Bank Transfer",
        accountName: "Priya Nair",
        accountNumber: "BPI 1122 3344 5566",
        instructions: "Use the booking date as your transfer note.",
        qrCodeImageUrl: placeholderQr("Tagum Hub BPI"),
        qrCodeFileName: "tagum-hub-bpi-qr.png",
      },
    ],
    wholeGymBooking: {
      enabled: true,
      pricePerHour: 34,
      availableSlots: ["8:00 AM", "10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"],
      notes: "Best for company sports days, school events, or private club sessions.",
    },
    courts: [
      {
        id: "northside-a",
        name: "Court A",
        surface: "Indoor cushioned",
        capacity: "Singles or doubles",
        pricePerHour: 12,
        status: "available",
        bookingMode: "private",
        availableSlots: ["8:00 AM", "9:30 AM", "1:00 PM", "5:30 PM"],
        imageUrl: placeholderPhoto("tagum-hub-a", 480, 320),
      },
      {
        id: "northside-b",
        name: "Court B",
        surface: "Indoor cushioned",
        capacity: "Doubles preferred",
        pricePerHour: 12,
        status: "available",
        bookingMode: "private",
        availableSlots: ["10:00 AM", "2:30 PM", "4:00 PM", "7:00 PM"],
        imageUrl: placeholderPhoto("tagum-hub-b", 480, 320),
      },
      {
        id: "northside-c",
        name: "Court C",
        surface: "Indoor premium",
        capacity: "Training court",
        pricePerHour: 16,
        status: "maintenance",
        bookingMode: "private",
        availableSlots: ["11:30 AM", "3:00 PM", "6:30 PM"],
        imageUrl: placeholderPhoto("tagum-hub-c", 480, 320),
      },
    ],
  },
  {
    id: "riverside",
    ownerId: "owner-2",
    name: "Apokon Rally Courts",
    address: "Apokon Road, Barangay Apokon, Tagum City",
    phone: "(084) 218-4471",
    status: "active",
    imageUrl: placeholderPhoto("apokon-rally", 800, 500),
    paymentOptions: [
      {
        provider: "Bank Transfer",
        accountName: "Marcus Diaz",
        accountNumber: "BDO 0199 0044 8832",
        instructions: "Include the court date in your transfer note before uploading proof.",
        qrCodeImageUrl: placeholderQr("Apokon Rally Bank"),
        qrCodeFileName: "apokon-rally-bank-qr.png",
      },
      {
        provider: "GCash",
        accountName: "Marcus Diaz",
        accountNumber: "09174445566",
        instructions: "Upload the GCash screenshot after payment.",
        qrCodeImageUrl: placeholderQr("Apokon Rally GCash"),
        qrCodeFileName: "apokon-rally-gcash-qr.png",
      },
    ],
    wholeGymBooking: {
      enabled: true,
      pricePerHour: 20,
      availableSlots: ["7:30 AM", "12:00 PM", "3:30 PM", "6:00 PM"],
      notes: "Single-court venue. Whole-gym booking reserves the full site for the selected slot.",
    },
    courts: [
      {
        id: "riverside-main",
        name: "Main Court",
        surface: "Outdoor acrylic",
        capacity: "Singles or doubles",
        pricePerHour: 12,
        status: "available",
        bookingMode: "private",
        availableSlots: ["7:30 AM", "12:00 PM", "3:30 PM", "6:00 PM"],
        imageUrl: placeholderPhoto("apokon-rally-main", 480, 320),
      },
    ],
  },
  {
    id: "central",
    ownerId: "owner-1",
    name: "Mankilam Court Club",
    address: "Mankilam Road, Barangay Mankilam, Tagum City",
    phone: "(084) 218-7782",
    status: "inactive",
    imageUrl: placeholderPhoto("mankilam-club", 800, 500),
    paymentOptions: [
      {
        provider: "Maya",
        accountName: "Priya Nair",
        accountNumber: "maya.me/mankilamclub",
        instructions: "Upload the full Maya receipt with the transaction reference.",
        qrCodeImageUrl: placeholderQr("Mankilam Maya"),
        qrCodeFileName: "mankilam-maya-qr.png",
      },
    ],
    courts: [
      {
        id: "central-1",
        name: "Court 1",
        surface: "Indoor hard court",
        capacity: "Doubles preferred",
        pricePerHour: 14,
        status: "available",
        bookingMode: "private",
        availableSlots: ["8:30 AM", "11:00 AM", "2:00 PM"],
        imageUrl: placeholderPhoto("mankilam-club-1", 480, 320),
      },
      {
        id: "central-2",
        name: "Court 2",
        surface: "Indoor hard court",
        capacity: "Singles or doubles",
        pricePerHour: 14,
        status: "available",
        bookingMode: "private",
        availableSlots: ["9:00 AM", "1:30 PM", "5:00 PM", "8:00 PM"],
        imageUrl: placeholderPhoto("mankilam-club-2", 480, 320),
      },
    ],
  },
  {
    id: "visayan-village",
    ownerId: "owner-2",
    name: "Visayan Village Pickleball Center",
    address: "National Highway, Barangay Visayan Village, Tagum City",
    phone: "(084) 218-3194",
    status: "active",
    imageUrl: placeholderPhoto("visayan-village-center", 800, 500),
    paymentOptions: [
      {
        provider: "GCash",
        accountName: "Marcus Diaz",
        accountNumber: "09179876543",
        instructions: "For doubles bookings, pay the full amount in one transfer.",
        qrCodeImageUrl: placeholderQr("Visayan Village GCash"),
        qrCodeFileName: "visayan-village-gcash-qr.png",
      },
      {
        provider: "Other",
        accountName: "Marcus Diaz",
        accountNumber: "MariBank 9988776655",
        instructions: "Use your name as the transfer remark for MariBank payments.",
        qrCodeImageUrl: placeholderQr("Visayan Village MariBank"),
        qrCodeFileName: "visayan-village-maribank-qr.png",
      },
    ],
    wholeGymBooking: {
      enabled: true,
      pricePerHour: 28,
      availableSlots: ["8:00 AM", "10:30 AM", "3:00 PM", "6:00 PM"],
      notes: "Includes exclusive use of all courts under one booking reference.",
    },
    courts: [
      {
        id: "visayan-village-1",
        name: "Court 1",
        surface: "Indoor cushioned",
        capacity: "Singles or doubles",
        pricePerHour: 13,
        status: "available",
        bookingMode: "private",
        availableSlots: ["6:30 AM", "9:00 AM", "4:30 PM", "7:30 PM"],
        imageUrl: placeholderPhoto("visayan-village-1", 480, 320),
      },
      {
        id: "visayan-village-2",
        name: "Court 2",
        surface: "Indoor cushioned",
        capacity: "Doubles preferred",
        pricePerHour: 13,
        status: "available",
        bookingMode: "open-play",
        openPlayCapacity: 10,
        availableSlots: ["8:00 AM", "10:30 AM", "3:00 PM", "6:00 PM"],
        imageUrl: placeholderPhoto("visayan-village-2", 480, 320),
      },
    ],
  },
  {
    id: "magugpo-east",
    ownerId: "owner-1",
    name: "Magugpo East Sports Hall",
    address: "Rizal Street, Magugpo East, Tagum City",
    phone: "(084) 218-6405",
    status: "active",
    imageUrl: placeholderPhoto("magugpo-east-hall", 800, 500),
    paymentOptions: [
      {
        provider: "Other",
        accountName: "Magugpo East Sports Hall",
        accountNumber: "Counter payment QR",
        instructions: "Use this venue QR and keep the screenshot visible when uploading proof.",
        qrCodeImageUrl: placeholderQr("Magugpo East QR"),
        qrCodeFileName: "magugpo-east-qr.png",
      },
    ],
    courts: [
      {
        id: "magugpo-east-1",
        name: "Hall Court",
        surface: "Indoor hard court",
        capacity: "Singles or doubles",
        pricePerHour: 15,
        status: "available",
        bookingMode: "private",
        availableSlots: ["7:00 AM", "11:00 AM", "2:30 PM", "5:00 PM"],
        imageUrl: placeholderPhoto("magugpo-east-1", 480, 320),
      },
      {
        id: "magugpo-east-2",
        name: "Training Court",
        surface: "Indoor hard court",
        capacity: "Training court",
        pricePerHour: 15,
        status: "maintenance",
        bookingMode: "private",
        availableSlots: ["1:00 PM", "4:00 PM"],
        imageUrl: placeholderPhoto("magugpo-east-2", 480, 320),
      },
    ],
  },
  {
    id: "madaum",
    ownerId: "owner-2",
    name: "Madaum Paddle and Pickle",
    address: "Madaum Road, Barangay Madaum, Tagum City",
    phone: "(084) 218-9026",
    status: "active",
    imageUrl: placeholderPhoto("madaum-paddle-pickle", 800, 500),
    paymentOptions: [
      {
        provider: "GCash",
        accountName: "Marcus Diaz",
        accountNumber: "09175550011",
        instructions: "Upload the receipt right after payment to hold the slot for review.",
        qrCodeImageUrl: placeholderQr("Madaum GCash"),
        qrCodeFileName: "madaum-gcash-qr.png",
      },
      {
        provider: "Bank Transfer",
        accountName: "Marcus Diaz",
        accountNumber: "MariBank 1234 5678 90",
        instructions: "MariBank transfers are accepted for this venue as well.",
        qrCodeImageUrl: placeholderQr("Madaum MariBank"),
        qrCodeFileName: "madaum-maribank-qr.png",
      },
    ],
    courts: [
      {
        id: "madaum-1",
        name: "Court A",
        surface: "Outdoor acrylic",
        capacity: "Singles or doubles",
        pricePerHour: 11,
        status: "available",
        bookingMode: "open-play",
        openPlayCapacity: 8,
        availableSlots: ["6:00 AM", "8:30 AM", "3:30 PM", "6:30 PM"],
        imageUrl: placeholderPhoto("madaum-1", 480, 320),
      },
    ],
  },
  {
    id: "canocotan",
    ownerId: "owner-1",
    name: "Canocotan Pickleball Arena",
    address: "Canocotan Road, Barangay Canocotan, Tagum City",
    phone: "(084) 218-5178",
    status: "active",
    imageUrl: placeholderPhoto("canocotan-arena", 800, 500),
    paymentOptions: [
      {
        provider: "Bank Transfer",
        accountName: "Priya Nair",
        accountNumber: "BPI 2231 8850 9021",
        instructions: "Send proof with the booking reference number after paying.",
        qrCodeImageUrl: placeholderQr("Canocotan Bank"),
        qrCodeFileName: "canocotan-bank-qr.png",
      },
      {
        provider: "GCash",
        accountName: "Priya Nair",
        accountNumber: "09176667788",
        instructions: "GCash is also supported for faster approval.",
        qrCodeImageUrl: placeholderQr("Canocotan GCash"),
        qrCodeFileName: "canocotan-gcash-qr.png",
      },
    ],
    wholeGymBooking: {
      enabled: true,
      pricePerHour: 36,
      availableSlots: ["9:00 AM", "12:30 PM", "4:30 PM", "8:00 PM"],
      notes: "Arena rental for leagues, company socials, and private tournaments.",
    },
    courts: [
      {
        id: "canocotan-1",
        name: "Arena Court 1",
        surface: "Indoor premium",
        capacity: "Doubles preferred",
        pricePerHour: 16,
        status: "available",
        bookingMode: "private",
        availableSlots: ["7:30 AM", "10:00 AM", "1:30 PM", "6:00 PM"],
        imageUrl: placeholderPhoto("canocotan-1", 480, 320),
      },
      {
        id: "canocotan-2",
        name: "Arena Court 2",
        surface: "Indoor premium",
        capacity: "Singles or doubles",
        pricePerHour: 16,
        status: "available",
        bookingMode: "open-play",
        openPlayCapacity: 12,
        availableSlots: ["9:00 AM", "12:30 PM", "4:30 PM", "8:00 PM"],
        imageUrl: placeholderPhoto("canocotan-2", 480, 320),
      },
    ],
  },
]

const GymsContext = React.createContext<GymsContextValue | undefined>(undefined)

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function GymsProvider({ children }: { children: React.ReactNode }) {
  const [gyms, setGyms] = React.useState<Gym[]>(initialGyms)

  const addGym = React.useCallback((gym: NewGym) => {
    const created: Gym = {
      ...gym,
      id: `${slugify(gym.name)}-${Date.now().toString(36)}`,
      status: gym.status ?? "active",
      courts: [],
    }
    setGyms((current) => [created, ...current])
    return created
  }, [])

  const updateGym = React.useCallback((id: string, update: GymUpdate) => {
    setGyms((current) =>
      current.map((gym) => (gym.id === id ? { ...gym, ...update } : gym))
    )
  }, [])

  const setGymStatus = React.useCallback((id: string, status: GymStatus) => {
    setGyms((current) =>
      current.map((gym) => (gym.id === id ? { ...gym, status } : gym))
    )
  }, [])

  const removeGym = React.useCallback((id: string) => {
    setGyms((current) => current.filter((gym) => gym.id !== id))
  }, [])

  const addCourt = React.useCallback((gymId: string, court: NewCourt) => {
    setGyms((current) =>
      current.map((gym) =>
        gym.id === gymId
          ? {
              ...gym,
              courts: [
                ...gym.courts,
                {
                  ...court,
                  id: `${gymId}-${slugify(court.name)}-${Date.now().toString(36)}`,
                  status: court.status ?? "available",
                },
              ],
            }
          : gym
      )
    )
  }, [])

  const updateCourt = React.useCallback(
    (gymId: string, courtId: string, update: CourtUpdate) => {
      setGyms((current) =>
        current.map((gym) =>
          gym.id === gymId
            ? {
                ...gym,
                courts: gym.courts.map((court) =>
                  court.id === courtId ? { ...court, ...update } : court
                ),
              }
            : gym
        )
      )
    },
    []
  )

  const setCourtStatus = React.useCallback(
    (gymId: string, courtId: string, status: CourtStatus) => {
      setGyms((current) =>
        current.map((gym) =>
          gym.id === gymId
            ? {
                ...gym,
                courts: gym.courts.map((court) =>
                  court.id === courtId ? { ...court, status } : court
                ),
              }
            : gym
        )
      )
    },
    []
  )

  const removeCourt = React.useCallback((gymId: string, courtId: string) => {
    setGyms((current) =>
      current.map((gym) =>
        gym.id === gymId
          ? { ...gym, courts: gym.courts.filter((court) => court.id !== courtId) }
          : gym
      )
    )
  }, [])

  const value = React.useMemo(
    () => ({
      gyms,
      addGym,
      updateGym,
      setGymStatus,
      removeGym,
      addCourt,
      updateCourt,
      setCourtStatus,
      removeCourt,
    }),
    [
      gyms,
      addGym,
      updateGym,
      setGymStatus,
      removeGym,
      addCourt,
      updateCourt,
      setCourtStatus,
      removeCourt,
    ]
  )

  return <GymsContext.Provider value={value}>{children}</GymsContext.Provider>
}

export function useGyms() {
  const context = React.useContext(GymsContext)

  if (context === undefined) {
    throw new Error("useGyms must be used within a GymsProvider")
  }

  return context
}
