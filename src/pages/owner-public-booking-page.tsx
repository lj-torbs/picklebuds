import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Search,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import { Input } from "@/components/ui/input"
import {
  getPublicOwnerBookingPageWithApi,
  type PublicOwnerBookingApiResponse,
} from "@/lib/booking-api"
import {
  buildOwnerBrandingStyle,
  mapOwnerBrandingApiToConfig,
} from "@/owner/lib/owner-branding-context"
import { GymPhoto } from "@/shared/components/gyms/gym-photo"
import { GymStatusBadge } from "@/shared/components/gyms/gym-status-badge"
import { PickleBuddyLogo } from "@/shared/components/brand/picklebuddy-logo"

function venueMatchesQuery(
  venue: PublicOwnerBookingApiResponse["venues"][number],
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    venue.name.toLowerCase().includes(normalizedQuery) ||
    venue.address.toLowerCase().includes(normalizedQuery)
  )
}

export function OwnerPublicBookingPage() {
  const { ownerSlug } = useParams<{ ownerSlug: string }>()
  const [page, setPage] = useState<PublicOwnerBookingApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!ownerSlug) {
      setError("Owner booking page was not found.")
      setIsLoading(false)
      return
    }

    let isActive = true
    setIsLoading(true)

    void getPublicOwnerBookingPageWithApi(ownerSlug)
      .then((response) => {
        if (!isActive) {
          return
        }
        setPage(response)
        setError(null)
      })
      .catch((nextError) => {
        if (!isActive) {
          return
        }
        setPage(null)
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Owner booking page was not found."
        )
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [ownerSlug])

  const branding = useMemo(
    () =>
      page?.owner_branding
        ? mapOwnerBrandingApiToConfig(
            page.owner_branding,
            page.business_name ?? page.owner_name
          )
        : null,
    [page]
  )
  const pageStyle = useMemo(
    () => (branding ? buildOwnerBrandingStyle(branding) : undefined),
    [branding]
  )
  const filteredVenues = useMemo(
    () =>
      (page?.venues ?? []).filter((venue) =>
        venueMatchesQuery(venue, searchQuery)
      ),
    [page?.venues, searchQuery]
  )
  const brandName = page?.business_name || page?.owner_name || "Owner booking"

  if (isLoading) {
    return (
      <main className="min-h-svh bg-muted/30 p-6">
        <p className="mx-auto max-w-3xl rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
          Loading booking page...
        </p>
      </main>
    )
  }

  if (error || !page || !ownerSlug) {
    return (
      <main className="min-h-svh bg-muted/30 p-6">
        <section className="mx-auto max-w-3xl rounded-lg border bg-background p-8 text-center">
          <h1 className="text-2xl font-semibold">Booking page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "The owner booking link is invalid or no longer exists."}
          </p>
          <Link
            to="/booking"
            className={buttonVariants({ className: "mt-5" })}
          >
            Browse all venues
          </Link>
        </section>
      </main>
    )
  }

  if (!page.is_available) {
    return (
      <main style={pageStyle} className="min-h-svh bg-muted/30 p-6">
        <section className="mx-auto max-w-3xl rounded-lg border bg-background p-8 text-center">
          <h1 className="text-2xl font-semibold">{brandName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This owner is not accepting bookings right now.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main style={pageStyle} className="min-h-svh bg-muted/30">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to={`/book/${ownerSlug}`} className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground shadow-sm">
              {branding?.logoImageUrl ? (
                <img
                  src={branding.logoImageUrl}
                  alt={`${brandName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <CalendarCheck className="size-5" aria-hidden="true" />
              )}
            </span>
            <span>
              <span className="block text-base leading-tight font-bold">
                {brandName}
              </span>
              <span className="block text-xs text-muted-foreground">
                Booking page
              </span>
            </span>
          </Link>
          <Link
            to="/my-bookings"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            My bookings
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Book with</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {brandName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a venue, view available courts and schedules, then submit
              your payment proof for owner confirmation.
            </p>
          </div>
          <div className="relative min-w-0 lg:w-80">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="h-10 pl-10"
              placeholder="Search venues"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        {filteredVenues.length === 0 ? (
          <div className="mt-5 rounded-lg border bg-background p-8 text-center shadow-xs">
            <p className="font-medium">No venues available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This owner has no active venues matching your search.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVenues.map((venue) => (
              <div
                key={venue.public_id}
                className="group flex flex-col overflow-hidden rounded-lg border bg-background shadow-xs transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
              >
                <div className="relative aspect-4/3">
                  <GymPhoto
                    src={venue.image_url ?? undefined}
                    alt={venue.name}
                    className="absolute inset-0 size-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3">
                    <GymStatusBadge status={venue.status} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{venue.address}</span>
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                      {venue.name}
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-md bg-muted/60 p-2">
                      <p className="text-xs text-muted-foreground">Courts</p>
                      <p className="font-semibold">{venue.court_count}</p>
                    </div>
                    <div className="rounded-md bg-muted/60 p-2">
                      <p className="text-xs text-muted-foreground">Open Play</p>
                      <p className="font-semibold">
                        {venue.has_open_play ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted/60 p-2">
                      <p className="text-xs text-muted-foreground">Whole Gym</p>
                      <p className="font-semibold">
                        {venue.whole_gym_enabled ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/book/${ownerSlug}/${venue.public_id}`}
                    className={buttonVariants({
                      className: "mt-auto w-full",
                    })}
                  >
                    View booking options
                    <ArrowRight
                      className="size-4 transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <PickleBuddyLogo className="size-5 rounded-sm shadow-xs" />
          <span>Powered by PickleBuddy</span>
        </div>
      </section>
    </main>
  )
}
