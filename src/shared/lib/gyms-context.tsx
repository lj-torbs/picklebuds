/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type GymStatus = "active" | "inactive"
export type CourtStatus = "available" | "maintenance"

export type Court = {
  id: string
  name: string
  surface: string
  capacity: string
  pricePerHour: number
  status: CourtStatus
  availableSlots: string[]
}

export type Gym = {
  id: string
  ownerId: string
  name: string
  address: string
  phone: string
  status: GymStatus
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
    name: "Northside Pickleball Gym",
    address: "12 Greenway Avenue",
    phone: "(555) 010-2231",
    status: "active",
    courts: [
      {
        id: "northside-a",
        name: "Court A",
        surface: "Indoor cushioned",
        capacity: "Singles or doubles",
        pricePerHour: 12,
        status: "available",
        availableSlots: ["8:00 AM", "9:30 AM", "1:00 PM", "5:30 PM"],
      },
      {
        id: "northside-b",
        name: "Court B",
        surface: "Indoor cushioned",
        capacity: "Doubles preferred",
        pricePerHour: 12,
        status: "available",
        availableSlots: ["10:00 AM", "2:30 PM", "4:00 PM", "7:00 PM"],
      },
      {
        id: "northside-c",
        name: "Court C",
        surface: "Indoor premium",
        capacity: "Training court",
        pricePerHour: 16,
        status: "maintenance",
        availableSlots: ["11:30 AM", "3:00 PM", "6:30 PM"],
      },
    ],
  },
  {
    id: "riverside",
    ownerId: "owner-2",
    name: "Riverside Sports Center",
    address: "88 Rally Road",
    phone: "(555) 010-4471",
    status: "active",
    courts: [
      {
        id: "riverside-main",
        name: "Main Court",
        surface: "Outdoor acrylic",
        capacity: "Singles or doubles",
        pricePerHour: 12,
        status: "available",
        availableSlots: ["7:30 AM", "12:00 PM", "3:30 PM", "6:00 PM"],
      },
    ],
  },
  {
    id: "central",
    ownerId: "owner-1",
    name: "Central Court Club",
    address: "204 Matchpoint Street",
    phone: "(555) 010-7782",
    status: "inactive",
    courts: [
      {
        id: "central-1",
        name: "Court 1",
        surface: "Indoor hard court",
        capacity: "Doubles preferred",
        pricePerHour: 14,
        status: "available",
        availableSlots: ["8:30 AM", "11:00 AM", "2:00 PM"],
      },
      {
        id: "central-2",
        name: "Court 2",
        surface: "Indoor hard court",
        capacity: "Singles or doubles",
        pricePerHour: 14,
        status: "available",
        availableSlots: ["9:00 AM", "1:30 PM", "5:00 PM", "8:00 PM"],
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
