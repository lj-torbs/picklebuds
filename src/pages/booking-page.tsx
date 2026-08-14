import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Clock3,
  MapPin,
  Search,
  Star,
  UserRound,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import { Input } from "@/components/ui/input"
import { GymPhoto } from "@/shared/components/gyms/gym-photo"
import { GymStatusBadge } from "@/shared/components/gyms/gym-status-badge"
import type { Court, Gym } from "@/shared/lib/gyms-context"
import { useGyms } from "@/shared/lib/gyms-context"

type AvailabilityFilter = "all" | "active" | "open-now"
type PriceFilter = "all" | "budget" | "standard" | "premium"

const gymMeta: Record<string, { distance: string; rating: string }> = {
  northside: { distance: "0.8 km", rating: "4.9" },
  riverside: { distance: "2.1 km", rating: "4.7" },
  central: { distance: "3.4 km", rating: "4.8" },
  "visayan-village": { distance: "4.2 km", rating: "4.6" },
  "magugpo-east": { distance: "1.6 km", rating: "4.8" },
  madaum: { distance: "6.9 km", rating: "4.5" },
  canocotan: { distance: "5.3 km", rating: "4.9" },
}

function getGymMeta(gym: Gym) {
  return gymMeta[gym.id] ?? { distance: "Nearby", rating: "New" }
}

function getGymLocation(gym: Gym) {
  const parts = gym.address.split(",").map((part) => part.trim())

  return parts.length >= 2 ? parts[parts.length - 2] : gym.address
}

function getOpenCourts(gym: Gym) {
  return gym.courts.filter((court) => court.status === "available")
}

function getOpenSlotCount(gym: Gym) {
  return getOpenCourts(gym).reduce(
    (total, court) => total + court.availableSlots.length,
    0
  )
}

function getNextSlot(gym: Gym) {
  return (
    getOpenCourts(gym).find((court) => court.availableSlots.length > 0)
      ?.availableSlots[0] ?? "No openings"
  )
}

function getPriceRange(courts: Court[]) {
  if (courts.length === 0) {
    return "No courts"
  }

  const prices = courts.map((court) => court.pricePerHour)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return min === max ? `$${min}/hr` : `$${min}-${max}/hr`
}

function courtMatchesPrice(court: Court, filter: PriceFilter) {
  if (filter === "budget") {
    return court.pricePerHour <= 12
  }

  if (filter === "standard") {
    return court.pricePerHour > 12 && court.pricePerHour <= 15
  }

  if (filter === "premium") {
    return court.pricePerHour > 15
  }

  return true
}

function gymMatchesQuery(gym: Gym, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    gym.name.toLowerCase().includes(normalizedQuery) ||
    gym.address.toLowerCase().includes(normalizedQuery) ||
    gym.courts.some(
      (court) =>
        court.name.toLowerCase().includes(normalizedQuery) ||
        court.surface.toLowerCase().includes(normalizedQuery) ||
        court.capacity.toLowerCase().includes(normalizedQuery)
    )
  )
}

function gymMatchesAvailability(gym: Gym, filter: AvailabilityFilter) {
  if (filter === "active") {
    return gym.status === "active"
  }

  if (filter === "open-now") {
    return gym.status === "active" && getOpenSlotCount(gym) > 0
  }

  return true
}

function gymMatchesPrice(gym: Gym, filter: PriceFilter) {
  return (
    filter === "all" ||
    gym.courts.some((court) => courtMatchesPrice(court, filter))
  )
}

export function BookingPage() {
  const { gyms } = useGyms()
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all")

  const locations = useMemo(
    () => Array.from(new Set(gyms.map((gym) => getGymLocation(gym)))).sort(),
    [gyms]
  )

  const filteredGyms = useMemo(
    () =>
      gyms.filter(
        (gym) =>
          gymMatchesQuery(gym, searchQuery) &&
          (locationFilter === "all" || getGymLocation(gym) === locationFilter) &&
          gymMatchesPrice(gym, priceFilter) &&
          gymMatchesAvailability(gym, availabilityFilter)
      ),
    [availabilityFilter, gyms, locationFilter, priceFilter, searchQuery]
  )

  const activeVenueCount = gyms.filter((gym) => gym.status === "active").length
  const totalOpenSlots = gyms.reduce(
    (total, gym) => total + getOpenSlotCount(gym),
    0
  )

  return (
    <main className="min-h-svh bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Find a court
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {gyms.length} venues in Tagum City · {activeVenueCount} accepting
            bookings · {totalOpenSlots} open slots today
          </p>
        </div>

        <div className="mt-4 grid gap-3 rounded-lg border bg-background p-3 shadow-xs sm:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(140px,1fr))]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="h-10 pl-10"
              placeholder="Search gym, barangay, court"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Filter by location"
          >
            <option value="all">All areas</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select
            value={priceFilter}
            onChange={(event) =>
              setPriceFilter(event.target.value as PriceFilter)
            }
            className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Filter by price"
          >
            <option value="all">Any price</option>
            <option value="budget">$12/hr and below</option>
            <option value="standard">$13-$15/hr</option>
            <option value="premium">$16/hr and up</option>
          </select>
          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value as AvailabilityFilter)
            }
            className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Filter by availability"
          >
            <option value="all">Any availability</option>
            <option value="active">Active venues</option>
            <option value="open-now">Has open slots</option>
          </select>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {filteredGyms.length} matching result
            {filteredGyms.length === 1 ? "" : "s"}
          </p>
          <span className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {locationFilter === "all" ? "Tagum City" : locationFilter}
          </span>
        </div>

        {filteredGyms.length === 0 ? (
          <div className="mt-4 rounded-lg border bg-background p-8 text-center shadow-xs">
            <p className="font-medium">No venues match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Change the location, price, availability, or search term.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGyms.map((gym) => {
              const meta = getGymMeta(gym)
              const openCourts = getOpenCourts(gym)

              return (
                <Link
                  key={gym.id}
                  to={`/booking/${gym.id}`}
                  className="group flex flex-col overflow-hidden rounded-lg border bg-background shadow-xs transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                >
                  <div className="relative aspect-4/3">
                    <GymPhoto
                      src={gym.imageUrl}
                      alt={gym.name}
                      className="absolute inset-0 size-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <GymStatusBadge status={gym.status} />
                    </div>
                    <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-background/95 px-2 py-1 text-xs font-medium text-foreground">
                        {meta.distance}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-background/95 px-2 py-1 text-xs font-medium text-foreground">
                        <Star
                          className="size-3 fill-primary text-primary"
                          aria-hidden="true"
                        />
                        {meta.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{getGymLocation(gym)}</span>
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight">
                        {gym.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {openCourts.length}/{gym.courts.length} court
                        {gym.courts.length === 1 ? "" : "s"} open
                      </span>
                      <span className="font-semibold">
                        {getPriceRange(gym.courts)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        Next: {getNextSlot(gym)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        View
                        <ArrowRight
                          className="size-3.5 transition group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
