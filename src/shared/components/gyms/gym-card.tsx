import { useState } from "react"
import { Building2, Pencil, Phone, Plus, Trash2 } from "lucide-react"

import {
  CourtStatusBadge,
  GymStatusBadge,
} from "@/shared/components/gyms/gym-status-badge"
import type { Court, Gym } from "@/shared/lib/gyms-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function GymCard({
  gym,
  onEditGym,
  onToggleGymStatus,
  onRemoveGym,
  onAddCourt,
  onEditCourt,
  onToggleCourtStatus,
  onRemoveCourt,
}: {
  gym: Gym
  onEditGym: (gym: Gym) => void
  onToggleGymStatus: (gym: Gym) => void
  onRemoveGym?: (gym: Gym) => void
  onAddCourt: (gymId: string) => void
  onEditCourt: (gymId: string, court: Court) => void
  onToggleCourtStatus: (gymId: string, court: Court) => void
  onRemoveCourt: (gymId: string, court: Court) => void
}) {
  const [confirmingRemoveGym, setConfirmingRemoveGym] = useState(false)
  const [confirmingRemoveCourtId, setConfirmingRemoveCourtId] = useState<
    string | null
  >(null)

  return (
    <Card className="rounded-lg">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{gym.name}</CardTitle>
            <GymStatusBadge status={gym.status} />
          </div>
          <CardDescription className="mt-1 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-3.5" aria-hidden="true" />
              {gym.address}
            </span>
            {gym.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" aria-hidden="true" />
                {gym.phone}
              </span>
            ) : null}
          </CardDescription>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEditGym(gym)}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleGymStatus(gym)}
          >
            {gym.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          {onRemoveGym ? (
            confirmingRemoveGym ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onRemoveGym(gym)
                    setConfirmingRemoveGym(false)
                  }}
                >
                  Confirm remove
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmingRemoveGym(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setConfirmingRemoveGym(true)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </Button>
            )
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Courts ({gym.courts.length})
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddCourt(gym.id)}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add court
          </Button>
        </div>

        {gym.courts.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            No courts yet. Add one to start taking bookings.
          </p>
        ) : (
          <div className="grid gap-2">
            {gym.courts.map((court) => (
              <div
                key={court.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{court.name}</span>
                    <CourtStatusBadge status={court.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {court.surface} · {court.capacity} · ${court.pricePerHour}
                    /hr · {court.availableSlots.length} slots
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleCourtStatus(gym.id, court)}
                  >
                    {court.status === "available"
                      ? "Mark maintenance"
                      : "Mark available"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${court.name}`}
                    onClick={() => onEditCourt(gym.id, court)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  {confirmingRemoveCourtId === court.id ? (
                    <>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          onRemoveCourt(gym.id, court)
                          setConfirmingRemoveCourtId(null)
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmingRemoveCourtId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${court.name}`}
                      onClick={() => setConfirmingRemoveCourtId(court.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
