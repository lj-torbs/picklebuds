import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Clock3, MapPin, Search, UsersRound } from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import { Input } from "@/components/ui/input"
import { useBookings } from "@/lib/bookings-context"
import { cn } from "@/lib/utils"
import { GymPhoto } from "@/shared/components/gyms/gym-photo"
import { GymStatusBadge } from "@/shared/components/gyms/gym-status-badge"
import type { Court, Gym } from "@/shared/lib/gyms-context"
import { useGyms } from "@/shared/lib/gyms-context"

type OpenPlayListing = {
  gym: Gym
  court: Court
  nextSession: string | null
  nextSeatsTaken: number
  nextSeatsLeft: number
  totalUpcomingSeats: number
}

const DAYS_IN_VIEW = 7

function buildFutureDays(startingFrom = new Date()) {
  return Array.from({ length: DAYS_IN_VIEW }, (_, index) => {
    const date = new Date(startingFrom)
    date.setDate(date.getDate() + index)
    return date.toISOString().slice(0, 10)
  })
}

function getOpenPlayPrice(court: Court) {
  if (!court.openPlayCapacity || court.openPlayCapacity <= 0) {
    return court.pricePerHour
  }

  return court.pricePerHour / court.openPlayCapacity
}

function getGymLocation(gym: Gym) {
  const parts = gym.address.split(",").map((part) => part.trim())
  return parts.length >= 2 ? parts[parts.length - 2] : gym.address
}

function formatSession(date: string, slot: string) {
  return `${new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} - ${slot}`
}

export function OpenPlayPanel() {
  const { gyms } = useGyms()
  const { getOpenPlaySeatsTaken } = useBookings()
  const [searchQuery, setSearchQuery] = useState("")

  const futureDays = useMemo(() => buildFutureDays(), [])

  const listings = useMemo<OpenPlayListing[]>(() => {
    return gyms
      .flatMap((gym) =>
        gym.courts
          .filter(
            (court) =>
              court.bookingMode === "open-play" &&
              court.status === "available" &&
              gym.status === "active" &&
              court.openPlayCapacity
          )
          .map((court) => {
            let nextSession: string | null = null
            let nextSeatsTaken = 0
            let nextSeatsLeft = 0
            let totalUpcomingSeats = 0

            futureDays.forEach((day) => {
              court.availableSlots.forEach((slot) => {
                const seatsTaken = getOpenPlaySeatsTaken(
                  gym.id,
                  court.id,
                  day,
                  slot
                )
                const seatsLeft = Math.max(
                  0,
                  (court.openPlayCapacity ?? 0) - seatsTaken
                )

                totalUpcomingSeats += seatsLeft

                if (!nextSession && seatsLeft > 0) {
                  nextSession = formatSession(day, slot)
                  nextSeatsTaken = seatsTaken
                  nextSeatsLeft = seatsLeft
                }
              })
            })

            return {
              gym,
              court,
              nextSession,
              nextSeatsTaken,
              nextSeatsLeft,
              totalUpcomingSeats,
            }
          })
      )
      .filter((listing) => listing.nextSession !== null)
  }, [futureDays, getOpenPlaySeatsTaken, gyms])

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return listings
    }

    return listings.filter(
      ({ gym, court }) =>
        gym.name.toLowerCase().includes(normalizedQuery) ||
        gym.address.toLowerCase().includes(normalizedQuery) ||
        court.name.toLowerCase().includes(normalizedQuery) ||
        court.surface.toLowerCase().includes(normalizedQuery)
    )
  }, [listings, searchQuery])

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Social sessions</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Join Open Play
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Split the court fee with other players, join available seats, and
            meet new pickleball partners.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-9"
            placeholder="Search venue, court, or area"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {filteredListings.length} Open Play court
          {filteredListings.length === 1 ? "" : "s"} available from Friday,
          August 21, 2026 onward
        </p>
        <Link
          to="/booking"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to court booking
        </Link>
      </div>

      {filteredListings.length === 0 ? (
        <div className="rounded-lg border bg-background p-8 text-center shadow-xs">
          <p className="font-medium">No Open Play sessions match right now</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another search or wait for more courts to be opened for group
            play.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredListings.map(
            ({
              gym,
              court,
              nextSession,
              nextSeatsTaken,
              nextSeatsLeft,
              totalUpcomingSeats,
            }) => (
              <Link
                key={court.id}
                to={`/booking/${gym.id}?court=${court.id}`}
                className="group grid gap-4 rounded-lg border bg-background p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md sm:grid-cols-[132px_minmax(0,1fr)]"
              >
                <div className="relative overflow-hidden rounded-lg border">
                  <GymPhoto
                    src={court.imageUrl ?? gym.imageUrl}
                    alt={court.name}
                    className="aspect-square w-full"
                  />
                  <div className="absolute inset-x-2 bottom-2">
                    <span className="inline-flex rounded-md bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground">
                      ${getOpenPlayPrice(court).toFixed(2)} / player
                    </span>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{gym.name}</span>
                    <GymStatusBadge status={gym.status} />
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Open Play
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{court.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {court.surface} - {court.capacity}
                    </p>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {getGymLocation(gym)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      Next session: {nextSession}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <UsersRound className="size-3.5" aria-hidden="true" />
                      {nextSeatsTaken}/{court.openPlayCapacity} booked next
                      session · {nextSeatsLeft} seats left · {totalUpcomingSeats}{" "}
                      seats this week
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Join session
                    <ArrowRight
                      className={cn(
                        "size-3.5 transition group-hover:translate-x-0.5"
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}
