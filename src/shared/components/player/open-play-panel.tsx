import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Clock3,
  Loader2,
  MapPin,
  Megaphone,
  Search,
  UsersRound,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { getAuthErrorMessage } from "@/lib/auth-api"
import { useAuth } from "@/lib/auth-context"
import { useBookings } from "@/lib/bookings-context"
import { formatCurrency } from "@/lib/currency"
import { announceOpenPlayWithApi } from "@/lib/notifications-api"
import { cn } from "@/lib/utils"
import { GymPhoto } from "@/shared/components/gyms/gym-photo"
import { GymStatusBadge } from "@/shared/components/gyms/gym-status-badge"
import type { Court, Gym } from "@/shared/lib/gyms-context"
import { useGyms } from "@/shared/lib/gyms-context"

type OpenPlayListing = {
  gym: Gym
  court: Court
  nextSession: string | null
  nextDate: string | null
  nextSlot: string | null
  nextSeatsTaken: number
  nextSeatsLeft: number
  totalUpcomingSeats: number
  canAnnounce: boolean
}

const DAYS_IN_VIEW = 7

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildFutureDays(startingFrom = new Date()) {
  return Array.from({ length: DAYS_IN_VIEW }, (_, index) => {
    const date = new Date(startingFrom)
    date.setDate(date.getDate() + index)
    return formatLocalDate(date)
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
  const { user } = useAuth()
  const { bookings, getOpenPlaySeatsTaken } = useBookings()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [announcingCourtId, setAnnouncingCourtId] = useState<string | null>(null)

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
            let nextDate: string | null = null
            let nextSlot: string | null = null
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
                  nextDate = day
                  nextSlot = slot
                  nextSeatsTaken = seatsTaken
                  nextSeatsLeft = seatsLeft
                }
              })
            })

            const playerHasJoined =
              nextDate !== null &&
              nextSlot !== null &&
              bookings.some(
                (booking) =>
                  booking.gymId === gym.id &&
                  booking.courtId === court.id &&
                  booking.bookingType === "open_play" &&
                  booking.date === nextDate &&
                  booking.slots.includes(nextSlot ?? "") &&
                  (booking.status === "pending" ||
                    booking.status === "confirmed")
              )

            return {
              gym,
              court,
              nextSession,
              nextDate,
              nextSlot,
              nextSeatsTaken,
              nextSeatsLeft,
              totalUpcomingSeats,
              canAnnounce: playerHasJoined,
            }
          })
      )
      .filter((listing) => listing.nextSession !== null)
  }, [bookings, futureDays, getOpenPlaySeatsTaken, gyms])

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

  async function handleAnnounce(listing: OpenPlayListing) {
    if (!user?.token) {
      toast.add({
        title: "Sign in required",
        description: "Log in as a player before announcing an Open Play session.",
        type: "error",
      })
      return
    }

    if (!listing.nextDate || !listing.nextSlot) {
      toast.add({
        title: "No Open Play session selected",
        description: "Choose an Open Play date and time before announcing.",
        type: "error",
      })
      return
    }

    const announcementKey = `${listing.court.id}:${listing.nextDate}:${listing.nextSlot}`
    setAnnouncingCourtId(announcementKey)
    try {
      const result = await announceOpenPlayWithApi(user.token, {
        venuePublicId: listing.gym.id,
        courtPublicId: listing.court.id,
        bookingDate: listing.nextDate,
        slotLabel: listing.nextSlot,
      })

      toast.add({
        title:
          result.notified_count > 0
            ? "Open Play announced"
            : "No opted-in players yet",
        description:
          result.notified_count > 0
            ? `${result.notified_count} player${
                result.notified_count === 1 ? "" : "s"
              } received your announcement.`
            : "No players have allowed Open Play announcements yet.",
        type: result.notified_count > 0 ? "success" : undefined,
      })
    } catch (error) {
      toast.add({
        title: "Unable to announce Open Play",
        description: getAuthErrorMessage(error, "Please try again."),
        type: "error",
      })
    } finally {
      setAnnouncingCourtId(null)
    }
  }

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
              nextDate,
              nextSlot,
              nextSeatsTaken,
              nextSeatsLeft,
              totalUpcomingSeats,
              canAnnounce,
            }) => (
              <div
                key={court.id}
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
                      {formatCurrency(getOpenPlayPrice(court))} / player
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/booking/${gym.id}?court=${court.id}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Join session
                      <ArrowRight
                        className={cn(
                          "size-3.5 transition group-hover/button:translate-x-0.5"
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                    {canAnnounce ? (
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-1.5"
                        )}
                        disabled={
                          announcingCourtId === `${court.id}:${nextDate}:${nextSlot}`
                        }
                        onClick={() => {
                          void handleAnnounce({
                            gym,
                            court,
                            nextSession,
                            nextDate,
                            nextSlot,
                            nextSeatsTaken,
                            nextSeatsLeft,
                            totalUpcomingSeats,
                            canAnnounce,
                          })
                        }}
                      >
                        {announcingCourtId === `${court.id}:${nextDate}:${nextSlot}` ? (
                          <Loader2
                            className="size-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Megaphone className="size-4" aria-hidden="true" />
                        )}
                        Announce to all
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
