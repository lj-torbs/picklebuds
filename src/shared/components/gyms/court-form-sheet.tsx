import { useState } from "react"

import type { Court, CourtStatus } from "@/shared/lib/gyms-context"
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

const slotOptions = [
  "7:30 AM",
  "8:00 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "8:00 PM",
]

type CourtFormValues = {
  name: string
  surface: string
  capacity: string
  pricePerHour: string
  status: CourtStatus
  availableSlots: string[]
}

type CourtSaveValues = {
  name: string
  surface: string
  capacity: string
  pricePerHour: number
  status: CourtStatus
  availableSlots: string[]
}

const emptyValues: CourtFormValues = {
  name: "",
  surface: "",
  capacity: "",
  pricePerHour: "",
  status: "available",
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
          status: court.status,
          availableSlots: court.availableSlots,
        }
      : emptyValues
  )

  function toggleSlot(slot: string) {
    setValues((current) => ({
      ...current,
      availableSlots: current.availableSlots.includes(slot)
        ? current.availableSlots.filter((current_slot) => current_slot !== slot)
        : [...current.availableSlots, slot],
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number(values.pricePerHour)
    if (!values.name.trim() || Number.isNaN(price) || price < 0) {
      return
    }
    onSave({
      name: values.name,
      surface: values.surface,
      capacity: values.capacity,
      pricePerHour: price,
      status: values.status,
      availableSlots: values.availableSlots,
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
          <Label>Available time slots</Label>
          <div className="flex flex-wrap gap-2">
            {slotOptions.map((slot) => (
              <Button
                key={slot}
                type="button"
                size="sm"
                variant={
                  values.availableSlots.includes(slot) ? "default" : "outline"
                }
                onClick={() => toggleSlot(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
        </div>
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
