import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
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
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { useBookings } from "@/lib/bookings-context"
import { cn } from "@/lib/utils"

type Court = {
  id: string
  name: string
  surface: string
  capacity: string
  availableSlots: string[]
}

type Gym = {
  id: string
  name: string
  address: string
  distance: string
  rating: string
  courts: Court[]
}

const gyms: Gym[] = [
  {
    id: "northside",
    name: "Northside Pickleball Gym",
    address: "12 Greenway Avenue",
    distance: "1.4 km away",
    rating: "4.9",
    courts: [
      {
        id: "northside-a",
        name: "Court A",
        surface: "Indoor cushioned",
        capacity: "Singles or doubles",
        availableSlots: ["8:00 AM", "9:30 AM", "1:00 PM", "5:30 PM"],
      },
      {
        id: "northside-b",
        name: "Court B",
        surface: "Indoor cushioned",
        capacity: "Doubles preferred",
        availableSlots: ["10:00 AM", "2:30 PM", "4:00 PM", "7:00 PM"],
      },
      {
        id: "northside-c",
        name: "Court C",
        surface: "Indoor premium",
        capacity: "Training court",
        availableSlots: ["11:30 AM", "3:00 PM", "6:30 PM"],
      },
      {
        id: "northside-d",
        name: "Court D",
        surface: "Indoor premium",
        capacity: "Training court",
        availableSlots: ["11:30 AM", "3:00 PM", "6:30 PM"],
      },
      {
        id: "northside-e",
        name: "Court E",
        surface: "Indoor premium",
        capacity: "Training court",
        availableSlots: ["11:30 AM", "3:00 PM", "6:30 PM"],
      },
    ],
  },
  {
    id: "riverside",
    name: "Riverside Sports Center",
    address: "88 Rally Road",
    distance: "3.2 km away",
    rating: "4.7",
    courts: [
      {
        id: "riverside-main",
        name: "Main Court",
        surface: "Outdoor acrylic",
        capacity: "Singles or doubles",
        availableSlots: ["7:30 AM", "12:00 PM", "3:30 PM", "6:00 PM"],
      },
    ],
  },
  {
    id: "central",
    name: "Central Court Club",
    address: "204 Matchpoint Street",
    distance: "4.8 km away",
    rating: "4.8",
    courts: [
      {
        id: "central-1",
        name: "Court 1",
        surface: "Indoor hard court",
        capacity: "Doubles preferred",
        availableSlots: ["8:30 AM", "11:00 AM", "2:00 PM"],
      },
      {
        id: "central-2",
        name: "Court 2",
        surface: "Indoor hard court",
        capacity: "Singles or doubles",
        availableSlots: ["9:00 AM", "1:30 PM", "5:00 PM", "8:00 PM"],
      },
    ],
  },
]

function getTodayValue() {
  return new Date().toISOString().slice(0, 10)
}

export function BookingPage() {
  const navigate = useNavigate()
  const { addBooking, isSlotBooked } = useBookings()
  const toast = useToast()

  const [selectedGymId, setSelectedGymId] = useState(gyms[0].id)
  const [selectedCourtId, setSelectedCourtId] = useState(gyms[0].courts[0].id)
  const [selectedDate, setSelectedDate] = useState(getTodayValue)
  const [selectedSlots, setSelectedSlots] = useState([
    gyms[0].courts[0].availableSlots[0],
  ])

  const selectedGym = useMemo(
    () => gyms.find((gym) => gym.id === selectedGymId) ?? gyms[0],
    [selectedGymId]
  )

  const selectedCourt = useMemo(
    () =>
      selectedGym.courts.find((court) => court.id === selectedCourtId) ??
      selectedGym.courts[0],
    [selectedCourtId, selectedGym]
  )

  const bookedSlots = useMemo(
    () =>
      new Set(
        selectedCourt.availableSlots.filter((slot) =>
          isSlotBooked(selectedGym.id, selectedCourt.id, selectedDate, slot)
        )
      ),
    [selectedGym.id, selectedCourt, selectedDate, isSlotBooked]
  )

  function pickFirstAvailableSlot(gym: Gym, court: Court, date: string) {
    return court.availableSlots.find((slot) => !isSlotBooked(gym.id, court.id, date, slot))
  }

  function handleGymChange(gym: Gym) {
    const court = gym.courts[0]
    setSelectedGymId(gym.id)
    setSelectedCourtId(court.id)
    const firstAvailable = pickFirstAvailableSlot(gym, court, selectedDate)
    setSelectedSlots(firstAvailable ? [firstAvailable] : [])
  }

  function handleCourtChange(court: Court) {
    setSelectedCourtId(court.id)
    const firstAvailable = pickFirstAvailableSlot(selectedGym, court, selectedDate)
    setSelectedSlots(firstAvailable ? [firstAvailable] : [])
  }

  function handleDateChange(nextDate: string) {
    setSelectedDate(nextDate)
    setSelectedSlots((currentSlots) =>
      currentSlots.filter(
        (slot) => !isSlotBooked(selectedGym.id, selectedCourt.id, nextDate, slot)
      )
    )
  }

  function toggleSlot(slot: string) {
    if (bookedSlots.has(slot)) {
      return
    }

    setSelectedSlots((currentSlots) => {
      if (currentSlots.includes(slot)) {
        return currentSlots.filter((currentSlot) => currentSlot !== slot)
      }

      return [...currentSlots, slot]
    })
  }

  function handleConfirmBooking() {
    if (selectedSlots.length === 0) {
      return
    }

    addBooking({
      gymId: selectedGym.id,
      gym: selectedGym.name,
      address: selectedGym.address,
      courtId: selectedCourt.id,
      court: selectedCourt.name,
      date: selectedDate,
      slots: selectedSlots,
    })
    toast.add({
      title: "Booking confirmed",
      description: `${selectedCourt.name} at ${selectedGym.name} on ${selectedDate}`,
      type: "success",
    })
    navigate("/my-bookings")
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
              <span className="block text-xs text-muted-foreground">Client booking</span>
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

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <p className="text-sm font-medium text-primary">Available courts</p>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Book a pickleball court
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Choose a gym, pick one of its courts, then reserve an available time slot.
                </p>
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input className="pl-8" placeholder="Search gyms or courts" />
              </div>
            </div>
          </div>

          <section className="grid gap-3">
            <Label>Gyms</Label>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {gyms.map((gym) => {
                const isSelected = gym.id === selectedGym.id

                return (
                  <button
                    key={gym.id}
                    type="button"
                    onClick={() => handleGymChange(gym)}
                    className={cn(
                      "rounded-lg border bg-card p-4 text-left shadow-xs transition hover:border-primary/60 hover:shadow-md",
                      isSelected && "border-primary ring-3 ring-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold leading-tight">{gym.name}</h2>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {gym.address}
                        </p>
                      </div>
                      <span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                        {gym.rating}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{gym.distance}</span>
                      <span>{gym.courts.length} court{gym.courts.length > 1 ? "s" : ""}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="grid gap-3">
            <Label>{selectedGym.name} courts</Label>
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              <div className="flex min-w-max snap-x gap-3">
              {selectedGym.courts.map((court) => {
                const isSelected = court.id === selectedCourt.id

                return (
                  <button
                    key={court.id}
                    type="button"
                    onClick={() => handleCourtChange(court)}
                    className={cn(
                      "w-64 snap-start rounded-lg border bg-background p-3 text-left shadow-xs transition hover:border-primary/60",
                      isSelected && "border-primary bg-primary/5 ring-3 ring-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-tight">{court.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{court.surface}</p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UsersRound className="size-3.5" aria-hidden="true" />
                        {court.capacity}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        {court.availableSlots.length} slots open
                      </span>
                    </div>
                  </button>
                )
              })}
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            <div className="grid gap-2 sm:max-w-xs">
              <Label htmlFor="booking-date">Booking date</Label>
              <DatePicker
                id="booking-date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="grid gap-3">
              <Label>Available time slots</Label>
              <div className="flex flex-wrap gap-2">
                {selectedCourt.availableSlots.map((slot) => {
                  const isBooked = bookedSlots.has(slot)

                  return (
                    <Button
                      key={slot}
                      type="button"
                      variant={selectedSlots.includes(slot) ? "default" : "outline"}
                      onClick={() => toggleSlot(slot)}
                      disabled={isBooked}
                      title={isBooked ? "Already booked" : undefined}
                    >
                      {slot}
                      {isBooked ? " (booked)" : ""}
                    </Button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Booking summary</CardTitle>
              <CardDescription>Review your selected schedule before confirming.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1">
                <span className="text-xs font-medium text-muted-foreground">Gym</span>
                <span className="font-medium">{selectedGym.name}</span>
                <span className="text-sm text-muted-foreground">{selectedGym.address}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-xs font-medium text-muted-foreground">Court</span>
                <span className="font-medium">{selectedCourt.name}</span>
                <span className="text-sm text-muted-foreground">{selectedCourt.surface}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">Date</span>
                  <span className="mt-1 block font-medium">{selectedDate}</span>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">Slots</span>
                  <span className="mt-1 block font-medium">{selectedSlots.length}</span>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <span className="block text-xs text-muted-foreground">
                  Selected time slots
                </span>
                <span className="mt-1 block font-medium">
                  {selectedSlots.length > 0 ? selectedSlots.join(", ") : "No slots selected"}
                </span>
              </div>
              <Button
                className="w-full"
                onClick={handleConfirmBooking}
                disabled={selectedSlots.length === 0}
              >
                <CalendarCheck className="size-4" aria-hidden="true" />
                Confirm booking
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}
