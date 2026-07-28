import { useState } from "react"
import { Plus } from "lucide-react"

import { CourtFormSheet } from "@/shared/components/gyms/court-form-sheet"
import { GymCard } from "@/shared/components/gyms/gym-card"
import { GymFormSheet } from "@/shared/components/gyms/gym-form-sheet"
import type {
  Court,
  CourtStatus,
  Gym,
  GymStatus,
} from "@/shared/lib/gyms-context"
import { useGyms } from "@/shared/lib/gyms-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

export function AdminGymsPage() {
  const {
    gyms,
    addGym,
    updateGym,
    setGymStatus,
    removeGym,
    addCourt,
    updateCourt,
    setCourtStatus,
    removeCourt,
  } = useGyms()
  const toast = useToast()

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
    status: GymStatus
  }) {
    if (editingGym) {
      updateGym(editingGym.id, values)
      toast.add({
        title: "Gym updated",
        description: `${values.name} has been updated.`,
        type: "success",
      })
    } else {
      addGym(values)
      toast.add({
        title: "Gym added",
        description: `${values.name} is now live on the platform.`,
        type: "success",
      })
    }
  }

  function handleRemoveGym(gym: Gym) {
    removeGym(gym.id)
    toast.add({
      title: "Gym removed",
      description: `${gym.name} has been removed.`,
      type: "success",
    })
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
    status: CourtStatus
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
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Gyms & courts
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage every venue on the platform, their courts, pricing, and
            availability.
          </p>
        </div>
        <Button type="button" onClick={openAddGym}>
          <Plus className="size-4" aria-hidden="true" />
          Add gym
        </Button>
      </div>

      <div className="grid gap-4">
        {gyms.map((gym) => (
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
            onRemoveGym={handleRemoveGym}
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
