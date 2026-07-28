import { useState } from "react"

import type { Gym, GymStatus } from "@/shared/lib/gyms-context"
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

type GymFormValues = {
  name: string
  address: string
  phone: string
  status: GymStatus
}

const emptyValues: GymFormValues = {
  name: "",
  address: "",
  phone: "",
  status: "active",
}

function GymFormBody({
  gym,
  onOpenChange,
  onSave,
}: {
  gym: Gym | null
  onOpenChange: (open: boolean) => void
  onSave: (values: GymFormValues) => void
}) {
  const [values, setValues] = useState<GymFormValues>(
    gym
      ? {
          name: gym.name,
          address: gym.address,
          phone: gym.phone,
          status: gym.status,
        }
      : emptyValues
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values.name.trim() || !values.address.trim()) {
      return
    }
    onSave(values)
    onOpenChange(false)
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{gym ? "Edit gym" : "Add gym"}</SheetTitle>
        <SheetDescription>
          {gym
            ? "Update this venue's details."
            : "Add a new venue to the platform."}
        </SheetDescription>
      </SheetHeader>

      <form id="gym-form" className="grid gap-4 px-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="gym-name">Gym name</Label>
          <Input
            id="gym-name"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gym-address">Address</Label>
          <Input
            id="gym-address"
            value={values.address}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gym-phone">Phone</Label>
          <Input
            id="gym-phone"
            value={values.phone}
            onChange={(event) =>
              setValues((current) => ({ ...current, phone: event.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label>Status</Label>
          <div className="flex gap-2">
            {(["active", "inactive"] as GymStatus[]).map((status) => (
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
      </form>

      <SheetFooter>
        <Button type="submit" form="gym-form">
          {gym ? "Save changes" : "Add gym"}
        </Button>
      </SheetFooter>
    </>
  )
}

export function GymFormSheet({
  gym,
  open,
  onOpenChange,
  onSave,
}: {
  gym: Gym | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: GymFormValues) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {open ? (
          <GymFormBody
            key={gym?.id ?? "new"}
            gym={gym}
            onOpenChange={onOpenChange}
            onSave={onSave}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
