import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  BadgeDollarSign,
  CalendarDays,
  ImageUp,
  MapPin,
  RefreshCw,
  Search,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/lib/auth-context"
import type { Booking } from "@/lib/bookings-context"
import { useBookings } from "@/lib/bookings-context"
import type { PaymentReceipt } from "@/shared/lib/payment-receipt"

type ClaimDraft = {
  referenceNumber: string
  accountName: string
  fileName: string
  imageUrl: string
}

const emptyDraft: ClaimDraft = {
  referenceNumber: "",
  accountName: "",
  fileName: "",
  imageUrl: "",
}

function getOfferTotal(booking: Booking) {
  return booking.pasalo?.askingPrice ?? 0
}

function formatBookingDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function getDateParts(date: string) {
  const parsed = new Date(`${date}T00:00:00`)

  return {
    month: parsed.toLocaleDateString("en-US", { month: "short" }),
    day: parsed.toLocaleDateString("en-US", { day: "numeric" }),
    weekday: parsed.toLocaleDateString("en-US", { weekday: "short" }),
  }
}

export function PasaloPanel() {
  const { user } = useAuth()
  const { bookings, claimPasalo } = useBookings()
  const navigate = useNavigate()
  const toast = useToast()
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [claimDraft, setClaimDraft] = useState<ClaimDraft>(emptyDraft)
  const [searchQuery, setSearchQuery] = useState("")
  const [slotFilter, setSlotFilter] = useState<"all" | "single" | "multi">(
    "all"
  )

  const pasaloBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status !== "cancelled" &&
          booking.status !== "completed" &&
          booking.pasalo?.status === "open"
      ),
    [bookings]
  )

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return pasaloBookings.filter((booking) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        booking.gym.toLowerCase().includes(normalizedQuery) ||
        booking.court.toLowerCase().includes(normalizedQuery) ||
        booking.address.toLowerCase().includes(normalizedQuery) ||
        booking.slots.some((slot) => slot.toLowerCase().includes(normalizedQuery))

      const matchesSlotFilter =
        slotFilter === "all" ||
        (slotFilter === "single" && booking.slots.length === 1) ||
        (slotFilter === "multi" && booking.slots.length > 1)

      return matchesQuery && matchesSlotFilter
    })
  }, [pasaloBookings, searchQuery, slotFilter])

  const selectedBooking =
    filteredBookings.find((booking) => booking.id === selectedBookingId) ??
    pasaloBookings.find((booking) => booking.id === selectedBookingId) ??
    null

  const claimIsComplete =
    claimDraft.referenceNumber.trim().length >= 6 &&
    claimDraft.accountName.trim().length > 0 &&
    claimDraft.imageUrl.length > 0

  function resetClaimForm() {
    setSelectedBookingId(null)
    setClaimDraft(emptyDraft)
  }

  function handleReceiptUpload(file: File | undefined) {
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Receipt must be an image",
        description: "Upload a screenshot or photo of the GCash transfer.",
        type: "error",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setClaimDraft((current) => ({
          ...current,
          fileName: file.name,
          imageUrl: reader.result,
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  function handleClaim() {
    if (!selectedBooking || !user || !claimIsComplete) {
      return
    }

    const transferReceipt: PaymentReceipt = {
      referenceNumber: claimDraft.referenceNumber.trim(),
      accountName: claimDraft.accountName.trim(),
      fileName: claimDraft.fileName,
      imageUrl: claimDraft.imageUrl,
      uploadedAt: new Date().toISOString(),
    }

    claimPasalo(selectedBooking.id, {
      claimantName: user.name,
      claimantEmail: user.email,
      transferReceipt,
    })

    toast.add({
      title: "Pasalo claimed",
      description: `${selectedBooking.id} is now pending transfer confirmation.`,
      type: "success",
    })
    navigate("/my-bookings")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-medium text-primary">Player transfers</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Pasalo board
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Claim a court slot from another player who can no longer use their
            reservation. Payment is handled directly between players through
            GCash for this prototype.
          </p>
        </div>

        <div className="grid gap-3 rounded-lg border bg-background p-3 shadow-xs sm:grid-cols-[minmax(220px,1.5fr)_auto_auto] sm:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              placeholder="Search gym, court, area, or time"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={slotFilter === "all" ? "default" : "outline"}
              onClick={() => setSlotFilter("all")}
            >
              All offers
            </Button>
            <Button
              type="button"
              size="sm"
              variant={slotFilter === "single" ? "default" : "outline"}
              onClick={() => setSlotFilter("single")}
            >
              Single slot
            </Button>
            <Button
              type="button"
              size="sm"
              variant={slotFilter === "multi" ? "default" : "outline"}
              onClick={() => setSlotFilter("multi")}
            >
              Multi slot
            </Button>
          </div>
          <div className="text-sm text-muted-foreground sm:text-right">
            {filteredBookings.length} result
            {filteredBookings.length === 1 ? "" : "s"}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-lg border bg-background p-8 text-center shadow-xs">
            <p className="font-medium">
              {pasaloBookings.length === 0
                ? "No Pasalo offers right now"
                : "No offers match your filters"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {pasaloBookings.length === 0
                ? "Check again later or book a court from the regular schedule."
                : "Try another search term or switch the slot filter."}
            </p>
            <Link to="/booking" className={buttonVariants({ className: "mt-4" })}>
              Browse courts
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-background shadow-xs">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_170px_minmax(0,1fr)_110px] gap-3 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground md:grid">
              <span>Venue</span>
              <span>Schedule</span>
              <span>Time slots</span>
              <span className="text-right">Price</span>
            </div>
            <div className="grid">
              {filteredBookings.map((booking) => {
                const isOwnOffer =
                  booking.ownerEmail?.toLowerCase() === user?.email.toLowerCase()
                const isSelected = selectedBookingId === booking.id
                const bookingDate = getDateParts(booking.date)

                return (
                  <button
                    key={booking.id}
                    type="button"
                    disabled={isOwnOffer}
                    onClick={() => {
                      setSelectedBookingId(booking.id)
                      setClaimDraft(emptyDraft)
                    }}
                    className={`grid gap-3 border-b px-4 py-3 text-left transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60 md:grid-cols-[minmax(0,1.5fr)_170px_minmax(0,1fr)_110px] md:items-center ${
                      isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/30" : ""
                    }`}
                  >
                    <div className="grid gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{booking.gym}</span>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                          {booking.id}
                        </span>
                        {isOwnOffer ? (
                          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                            Your offer
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm font-medium">{booking.court}</p>
                      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" aria-hidden="true" />
                        {booking.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 md:justify-start">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md border bg-background">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                          {bookingDate.month}
                        </span>
                        <span className="text-lg font-semibold leading-none">
                          {bookingDate.day}
                        </span>
                      </div>
                      <div className="grid gap-0.5">
                        <span className="text-xs font-medium">{bookingDate.weekday}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatBookingDate(booking.date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.slots.map((slot) => (
                        <span
                          key={slot}
                          className="rounded-md border bg-background px-2.5 py-1 text-xs font-semibold"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                    <div className="grid gap-0.5 md:text-right">
                      <span className="text-[11px] text-muted-foreground">
                        Asking price
                      </span>
                      <span className="text-lg font-semibold">
                        ${getOfferTotal(booking)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Claim Pasalo</CardTitle>
            <CardDescription>
              Upload your GCash transfer proof to take over the selected
              booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {selectedBooking ? (
              <>
                {(() => {
                  const bookingDate = getDateParts(selectedBooking.date)

                  return (
                    <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Selected booking
                        </span>
                        <span className="mt-1 block font-medium">
                          {selectedBooking.gym}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {selectedBooking.court}
                        </span>
                      </div>
                      <div className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[80px_minmax(0,1fr)]">
                        <div className="flex min-h-22 flex-col rounded-md border text-center">
                          <span className="rounded-t-md border-b bg-primary px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                            {bookingDate.month}
                          </span>
                          <span className="pt-2.5 text-2xl font-semibold leading-none">
                            {bookingDate.day}
                          </span>
                          <span className="pb-2.5 pt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            {bookingDate.weekday}
                          </span>
                        </div>
                        <div className="grid content-center gap-2">
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            <CalendarDays className="size-3.5" aria-hidden="true" />
                            Schedule
                          </div>
                          <p className="text-sm font-medium">
                            {formatBookingDate(selectedBooking.date)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedBooking.slots.map((slot) => (
                              <span
                                key={slot}
                                className="rounded-md border bg-muted px-2.5 py-1.5 text-sm font-semibold"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <BadgeDollarSign className="size-4" aria-hidden="true" />
                          Transfer amount
                        </span>
                        <span className="font-semibold">
                          ${getOfferTotal(selectedBooking)}
                        </span>
                      </div>
                    </div>
                  )
                })()}

                <div className="grid gap-3 rounded-lg border p-3">
                  <div className="grid gap-2">
                    <Label htmlFor="pasalo-reference">GCash reference number</Label>
                    <Input
                      id="pasalo-reference"
                      value={claimDraft.referenceNumber}
                      onChange={(event) =>
                        setClaimDraft((current) => ({
                          ...current,
                          referenceNumber: event.target.value,
                        }))
                      }
                      placeholder="e.g. 1002 345 678901"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pasalo-account-name">Sender account name</Label>
                    <Input
                      id="pasalo-account-name"
                      value={claimDraft.accountName}
                      onChange={(event) =>
                        setClaimDraft((current) => ({
                          ...current,
                          accountName: event.target.value,
                        }))
                      }
                      placeholder="Name shown on the receipt"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pasalo-receipt">Receipt image</Label>
                    <Input
                      id="pasalo-receipt"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleReceiptUpload(event.target.files?.[0])
                      }
                    />
                    {claimDraft.fileName ? (
                      <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                        <ImageUp className="size-4" aria-hidden="true" />
                        <span className="truncate">{claimDraft.fileName}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleClaim}
                    disabled={!claimIsComplete}
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Submit transfer proof
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resetClaimForm}
                  >
                    Clear selection
                  </Button>
                </div>
              </>
            ) : (
              <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Select an available Pasalo offer to start the transfer.
              </p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
