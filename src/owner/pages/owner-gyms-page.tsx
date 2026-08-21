import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { CourtFormSheet } from "@/shared/components/gyms/court-form-sheet"
import { GymCard } from "@/shared/components/gyms/gym-card"
import { GymFormSheet } from "@/shared/components/gyms/gym-form-sheet"
import type { Court, CourtStatus, Gym, GymStatus } from "@/shared/lib/gyms-context"
import { useGyms } from "@/shared/lib/gyms-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

export function OwnerGymsPage() {
  const { owner } = useOwnerAuth()
  const { gyms, updateGym, setGymStatus, addCourt, updateCourt, setCourtStatus, removeCourt } =
    useGyms()
  const toast = useToast()

  const ownedGyms = useMemo(
    () => gyms.filter((gym) => gym.ownerId === owner?.id),
    [gyms, owner]
  )

  const [gymFormOpen, setGymFormOpen] = useState(false)
  const [editingGym, setEditingGym] = useState<Gym | null>(null)

  const [courtFormOpen, setCourtFormOpen] = useState(false)
  const [activeGymId, setActiveGymId] = useState<string | null>(null)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)

  function openAddGym() {
    setEditingGym(null)
    setGymFormOpen(true)
  }

  function handleSaveGym(values: {
    name: string
    address: string
    phone: string
    imageUrl?: string
    status: GymStatus
    paymentOptions: Gym["paymentOptions"]
    wholeGymBooking?: Gym["wholeGymBooking"]
  }) {
    if (!owner?.id) {
      return
    }

    if (editingGym) {
      updateGym(editingGym.id, values)
      toast.add({
        title: "Gym updated",
        description: `${values.name} has been updated.`,
        type: "success",
      })
    } else {
      addGym({ ...values, ownerId: owner.id })
      toast.add({
        title: "Gym added",
        description: `${values.name} is now part of your venues.`,
        type: "success",
      })
    }
  }

  function openAddCourt(gymId: string) {
    setActiveGymId(gymId)
    setEditingCourt(null)
    setCourtFormOpen(true)
  }

  function handleSaveCourt(values: {
    name: string
    surface: string
    capacity: string
    pricePerHour: number
    imageUrl?: string
    status: CourtStatus
    bookingMode: Court["bookingMode"]
    openPlayCapacity?: number
    availableSlots: string[]
  }) {
    if (!activeGymId) {
      return
    }

    if (editingCourt) {
      updateCourt(activeGymId, editingCourt.id, values)
      toast.add({
        title: "Court updated",
        description: `${values.name} has been updated.`,
        type: "success",
      })
    } else {
      addCourt(activeGymId, values)
      toast.add({
        title: "Court added",
        description: `${values.name} has been added.`,
        type: "success",
      })
    }
  }

  function handleRemoveCourt(gymId: string, court: Court) {
    removeCourt(gymId, court.id)
    toast.add({
      title: "Court removed",
      description: `${court.name} has been removed.`,
      type: "success",
    })
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Venues</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">My gyms</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage your courts, pricing, payment methods, and booking
            availability across every venue you operate.
          </p>
        </div>
        <Button type="button" onClick={openAddGym}>
          <Plus className="size-4" aria-hidden="true" />
          Add gym
        </Button>
      </div>

      {ownedGyms.length === 0 ? (
        <div className="grid gap-4 rounded-lg border bg-card p-6 text-center">
          <div className="grid gap-1">
            <p className="text-sm font-medium">No venues are linked yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first gym to start setting up courts, booking slots, and
              payment collection.
            </p>
          </div>
          <div className="flex justify-center">
            <Button type="button" onClick={openAddGym}>
              <Plus className="size-4" aria-hidden="true" />
              Add gym
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {ownedGyms.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              onEditGym={(current) => {
                setEditingGym(current)
                setGymFormOpen(true)
              }}
              onToggleGymStatus={(current) =>
                setGymStatus(
                  current.id,
                  current.status === "active" ? "inactive" : "active"
                )
              }
              onAddCourt={openAddCourt}
              onEditCourt={(gymId, court) => {
                setActiveGymId(gymId)
                setEditingCourt(court)
                setCourtFormOpen(true)
              }}
              onToggleCourtStatus={(gymId, court) =>
                setCourtStatus(
                  gymId,
                  court.id,
                  court.status === "available" ? "maintenance" : "available"
                )
              }
              onRemoveCourt={handleRemoveCourt}
            />
          ))}
        </div>
      )}

      <GymFormSheet
        gym={editingGym}
        open={gymFormOpen}
        onOpenChange={setGymFormOpen}
        onSave={handleSaveGym}
      />

      <CourtFormSheet
        court={editingCourt}
        open={courtFormOpen}
        onOpenChange={setCourtFormOpen}
        onSave={handleSaveCourt}
      />
    </div>
  )
}
