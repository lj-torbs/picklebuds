import { useState } from "react"
import {
  Building2,
  Package,
  Pencil,
  Phone,
  Plus,
  QrCode,
  Trash2,
  Wallet,
} from "lucide-react"

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
      {gym.imageUrl ? (
        <div className="aspect-[16/5] overflow-hidden rounded-t-lg border-b bg-muted/30">
          <img
            src={gym.imageUrl}
            alt={`${gym.name} cover`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
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

        <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">Payment destination</span>
          </div>
          {gym.paymentOptions.length > 0 ? (
            <div className="grid gap-2">
              {gym.paymentOptions.map((paymentOption, index) => (
                <div
                  key={`${paymentOption.provider}-${paymentOption.accountNumber}-${index}`}
                  className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="grid gap-1 text-sm">
                    <span className="font-medium">
                      {paymentOption.provider} - {paymentOption.accountName}
                    </span>
                    <span className="text-muted-foreground">
                      {paymentOption.accountNumber}
                    </span>
                    {paymentOption.instructions ? (
                      <span className="text-xs text-muted-foreground">
                        {paymentOption.instructions}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <QrCode className="size-4" aria-hidden="true" />
                    {paymentOption.qrCodeFileName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No payment QR configured yet. Players will not be able to submit
              a receipt until this is set up.
            </p>
          )}
        </div>

        <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">Whole gym booking</span>
          </div>
          {gym.wholeGymBooking?.enabled ? (
            <div className="grid gap-1 text-sm">
              <span className="font-medium">
                ${gym.wholeGymBooking.pricePerHour}/hr for exclusive venue use
              </span>
              <span className="text-muted-foreground">
                {gym.wholeGymBooking.availableSlots.length} slots available
              </span>
              {gym.wholeGymBooking.notes ? (
                <span className="text-xs text-muted-foreground">
                  {gym.wholeGymBooking.notes}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Whole gym booking is currently disabled for this venue.
            </p>
          )}
        </div>

        <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">Gear rental</span>
          </div>
          {gym.rentalItems.length > 0 ? (
            <div className="grid gap-1 text-sm">
              {gym.rentalItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="min-w-0 truncate">
                    {item.name}
                    <span className="text-muted-foreground">
                      {" "}
                      · {item.quantityAvailable} in stock
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">
                    ${item.pricePerSession}
                    <span className="text-xs font-normal text-muted-foreground">
                      /session
                    </span>
                    {item.status === "unavailable" ? (
                      <span className="ml-1.5 text-xs font-normal text-destructive">
                        off
                      </span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No gear listed. Players can only book courts at this venue.
            </p>
          )}
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
                <div className="flex min-w-0 items-start gap-3">
                  {court.imageUrl ? (
                    <img
                      src={court.imageUrl}
                      alt={`${court.name} preview`}
                      className="h-16 w-24 shrink-0 rounded-md border object-cover"
                    />
                  ) : null}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{court.name}</span>
                      <CourtStatusBadge status={court.status} />
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {court.bookingMode === "open-play"
                          ? "Open Play"
                          : "Private"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {court.surface} - {court.capacity} - ${court.pricePerHour}
                      /hr - {court.availableSlots.length} slots
                      {court.bookingMode === "open-play" &&
                      court.openPlayCapacity
                        ? ` - ${court.openPlayCapacity} players`
                        : ""}
                    </p>
                  </div>
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
