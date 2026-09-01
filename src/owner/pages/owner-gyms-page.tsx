import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"

import { OwnerWorkspaceHero } from "@/owner/components/layout/owner-workspace-hero"
import { CourtFormSheet } from "@/shared/components/gyms/court-form-sheet"
import { GymCard } from "@/shared/components/gyms/gym-card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import {
  createOwnerCourtWithApi,
  deleteOwnerCourtWithApi,
  getOwnerVenuesWithApi,
  setOwnerCourtStatusWithApi,
  setOwnerVenueStatusWithApi,
  updateOwnerCourtWithApi,
} from "@/lib/owner-api"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { mapOwnerVenueToGym } from "@/owner/lib/owner-venue-mappers"
import type { Court, CourtStatus, Gym } from "@/shared/lib/gyms-context"

export function OwnerGymsPage() {
  const { owner } = useOwnerAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [error, setError] = useState<string | null>(null)
  const [courtFormOpen, setCourtFormOpen] = useState(false)
  const [activeGymId, setActiveGymId] = useState<string | null>(null)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)

  useEffect(() => {
    if (!owner?.token) {
      return
    }

    let isActive = true

    void getOwnerVenuesWithApi(owner.token)
      .then((items) => {
        if (!isActive) {
          return
        }
        setGyms(items.map(mapOwnerVenueToGym))
        setError(null)
      })
      .catch((nextError) => {
        if (!isActive) {
          return
        }
        setGyms([])
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load your gyms."
        )
      })

    return () => {
      isActive = false
    }
  }, [owner?.token])

  function replaceGym(nextGym: Gym) {
    setGyms((current) =>
      current.map((gym) => (gym.id === nextGym.id ? nextGym : gym))
    )
  }

  function openAddCourt(gymId: string) {
    setActiveGymId(gymId)
    setEditingCourt(null)
    setCourtFormOpen(true)
  }

  async function handleSaveCourt(values: {
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
    if (!owner?.token || !activeGymId) {
      return
    }

    try {
      const response = editingCourt
        ? await updateOwnerCourtWithApi(
            owner.token,
            activeGymId,
            editingCourt.id,
            values
          )
        : await createOwnerCourtWithApi(owner.token, activeGymId, values)
      replaceGym(mapOwnerVenueToGym(response))
      toast.add({
        title: editingCourt ? "Court updated" : "Court added",
        description: `${values.name} has been ${editingCourt ? "updated" : "added"}.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to save court",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleToggleGymStatus(gym: Gym) {
    if (!owner?.token) {
      return
    }

    const nextStatus = gym.status === "active" ? "inactive" : "active"
    try {
      const response = await setOwnerVenueStatusWithApi(
        owner.token,
        gym.id,
        nextStatus
      )
      replaceGym(mapOwnerVenueToGym(response))
      toast.add({
        title: nextStatus === "active" ? "Gym activated" : "Gym deactivated",
        description: `${gym.name} is now ${nextStatus}.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to update gym",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleToggleCourtStatus(gymId: string, court: Court) {
    if (!owner?.token) {
      return
    }

    const nextStatus =
      court.status === "available" ? "maintenance" : "available"
    try {
      const response = await setOwnerCourtStatusWithApi(
        owner.token,
        gymId,
        court.id,
        nextStatus
      )
      replaceGym(mapOwnerVenueToGym(response))
      toast.add({
        title: "Court status updated",
        description: `${court.name} is now ${nextStatus}.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to update court",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    }
  }

  async function handleRemoveCourt(gymId: string, court: Court) {
    if (!owner?.token) {
      return
    }

    try {
      const response = await deleteOwnerCourtWithApi(
        owner.token,
        gymId,
        court.id
      )
      replaceGym(mapOwnerVenueToGym(response))
      toast.add({
        title: "Court removed",
        description: `${court.name} has been removed.`,
        type: "success",
      })
    } catch (nextError) {
      toast.add({
        title: "Unable to remove court",
        description:
          nextError instanceof Error ? nextError.message : "Please try again.",
        type: "error",
      })
    }
  }

  return (
    <div className="grid gap-6">
      <OwnerWorkspaceHero
        eyebrow="Venues"
        title="Venue management"
        description="Manage courts, payment methods, whole gym access, and booking availability across every venue in your owner workspace."
        meta="Venue management"
        actions={
          <Button type="button" onClick={() => navigate("/owner/gyms/new")}>
            <Plus className="size-4" aria-hidden="true" />
            Add gym
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : gyms.length === 0 ? (
        <div className="grid gap-4 rounded-lg border bg-card p-6 text-center">
          <div className="grid gap-1">
            <p className="text-sm font-medium">No venues are linked yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first gym to start setting up courts, booking slots, and
              payment collection.
            </p>
          </div>
          <div className="flex justify-center">
            <Button type="button" onClick={() => navigate("/owner/gyms/new")}>
              <Plus className="size-4" aria-hidden="true" />
              Add gym
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {gyms.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              onEditGym={(current) =>
                navigate(`/owner/gyms/${current.id}/edit`)
              }
              onToggleGymStatus={handleToggleGymStatus}
              onAddCourt={openAddCourt}
              onEditCourt={(gymId, court) => {
                setActiveGymId(gymId)
                setEditingCourt(court)
                setCourtFormOpen(true)
              }}
              onToggleCourtStatus={handleToggleCourtStatus}
              onRemoveCourt={handleRemoveCourt}
            />
          ))}
        </div>
      )}

      <CourtFormSheet
        court={editingCourt}
        open={courtFormOpen}
        onOpenChange={setCourtFormOpen}
        onSave={handleSaveCourt}
      />
    </div>
  )
}
