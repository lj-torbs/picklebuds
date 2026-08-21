import { useState } from "react"

import type {
  BookingMode,
  Court,
  CourtStatus,
} from "@/shared/lib/gyms-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  TimeRangeEditor,
} from "@/shared/components/gyms/time-range-editor"
import {
  createTimeRangeDrafts,
  normalizeTimeRanges,
} from "@/shared/components/gyms/time-range-utils"

type CourtFormValues = {
  name: string
  surface: string
  capacity: string
  pricePerHour: string
  imageUrl?: string
  status: CourtStatus
  bookingMode: BookingMode
  openPlayCapacity: string
  availableSlots: string[]
}

type CourtSaveValues = {
  name: string
  surface: string
  capacity: string
  pricePerHour: number
  imageUrl?: string
  status: CourtStatus
  bookingMode: BookingMode
  openPlayCapacity?: number
  availableSlots: string[]
}

const emptyValues: CourtFormValues = {
  name: "",
  surface: "",
  capacity: "",
  pricePerHour: "",
  imageUrl: "",
  status: "available",
  bookingMode: "private",
  openPlayCapacity: "",
  availableSlots: [],
}

function CourtFormBody({
  court,
  onOpenChange,
  onSave,
}: {
  court: Court | null
  onOpenChange: (open: boolean) => void
  onSave: (values: CourtSaveValues) => void
}) {
  const [values, setValues] = useState<CourtFormValues>(
    court
      ? {
          name: court.name,
          surface: court.surface,
          capacity: court.capacity,
          pricePerHour: String(court.pricePerHour),
          imageUrl: court.imageUrl ?? "",
          status: court.status,
          bookingMode: court.bookingMode,
          openPlayCapacity: court.openPlayCapacity
            ? String(court.openPlayCapacity)
            : "",
          availableSlots: court.availableSlots,
        }
      : emptyValues
  )
  const [timeRanges, setTimeRanges] = useState(() =>
    createTimeRangeDrafts(court?.availableSlots ?? [])
  )

  function handleCourtImageUpload(file: File | undefined) {
    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result

      if (typeof result === "string") {
        setValues((current) => ({ ...current, imageUrl: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number(values.pricePerHour)
    const openPlayCapacity = Number(values.openPlayCapacity)

    if (!values.name.trim() || Number.isNaN(price) || price < 0) {
      return
    }

    if (
      values.bookingMode === "open-play" &&
      (Number.isNaN(openPlayCapacity) || openPlayCapacity < 2)
    ) {
      return
    }
    onSave({
      name: values.name,
      surface: values.surface,
      capacity: values.capacity,
      pricePerHour: price,
      imageUrl: values.imageUrl || undefined,
      status: values.status,
      bookingMode: values.bookingMode,
      openPlayCapacity:
        values.bookingMode === "open-play" ? openPlayCapacity : undefined,
      availableSlots: normalizeTimeRanges(timeRanges),
    })
    onOpenChange(false)
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{court ? "Edit court" : "Add court"}</SheetTitle>
        <SheetDescription>
          {court
            ? "Update this court's details and availability."
            : "Add a new court to this gym."}
        </SheetDescription>
      </SheetHeader>

      <form id="court-form" className="grid gap-4 px-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="court-name">Court name</Label>
          <Input
            id="court-name"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="court-surface">Surface</Label>
            <Input
              id="court-surface"
              value={values.surface}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  surface: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="court-capacity">Capacity</Label>
            <Input
              id="court-capacity"
              value={values.capacity}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  capacity: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="court-price">Price per hour ($)</Label>
          <Input
            id="court-price"
            type="number"
            min="0"
            step="1"
            value={values.pricePerHour}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                pricePerHour: event.target.value,
              }))
            }
            required
          />
        </div>

        <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
          <div>
            <Label htmlFor="court-image">Court image</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a court photo so players can distinguish one court from
              another before booking.
            </p>
          </div>
          <Input
            id="court-image"
            type="file"
            accept="image/*"
            onChange={(event) => handleCourtImageUpload(event.target.files?.[0])}
          />
          {values.imageUrl ? (
            <div className="grid gap-2 rounded-md border bg-background p-3">
              <img
                src={values.imageUrl}
                alt="Court image preview"
                className="aspect-[16/9] w-full rounded-md border object-cover"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setValues((current) => ({ ...current, imageUrl: "" }))
                  }
                >
                  Remove image
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label>Status</Label>
          <div className="flex gap-2">
            {(["available", "maintenance"] as CourtStatus[]).map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={values.status === status ? "default" : "outline"}
                className={cn(
                  "capitalize",
                  values.status === status && "pointer-events-none"
                )}
                onClick={() => setValues((current) => ({ ...current, status }))}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Booking mode</Label>
          <div className="flex gap-2">
            {(["private", "open-play"] as BookingMode[]).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={values.bookingMode === mode ? "default" : "outline"}
                className={cn(
                  values.bookingMode === mode && "pointer-events-none"
                )}
                onClick={() =>
                  setValues((current) => ({ ...current, bookingMode: mode }))
                }
              >
                {mode === "private" ? "Private court" : "Open Play"}
              </Button>
            ))}
          </div>
        </div>

        {values.bookingMode === "open-play" ? (
          <div className="grid gap-2">
            <Label htmlFor="open-play-capacity">Open Play player limit</Label>
            <Input
              id="open-play-capacity"
              type="number"
              min="2"
              step="1"
              value={values.openPlayCapacity}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  openPlayCapacity: event.target.value,
                }))
              }
              placeholder="e.g. 10"
              required
            />
            <p className="text-xs text-muted-foreground">
              The app will split the court price evenly per player seat.
            </p>
          </div>
        ) : null}

        <TimeRangeEditor
          label="Court booking time windows"
          helperText="Add custom booking ranges for this court. Owners can define any start and end time instead of choosing from fixed slots."
          ranges={timeRanges}
          onChange={setTimeRanges}
          addLabel="Add court time window"
        />
      </form>

      <SheetFooter>
        <Button type="submit" form="court-form">
          {court ? "Save changes" : "Add court"}
        </Button>
      </SheetFooter>
    </>
  )
}

export function CourtFormSheet({
  court,
  open,
  onOpenChange,
  onSave,
}: {
  court: Court | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: CourtSaveValues) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {open ? (
          <CourtFormBody
            key={court?.id ?? "new"}
            court={court}
            onOpenChange={onOpenChange}
            onSave={onSave}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
