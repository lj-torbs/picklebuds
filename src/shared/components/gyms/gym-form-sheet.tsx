import { useState } from "react"

import type {
  Gym,
  GymPaymentSetup,
  GymStatus,
  PaymentProvider,
  WholeGymBookingSetup,
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

type GymFormValues = {
  name: string
  address: string
  phone: string
  imageUrl?: string
  status: GymStatus
  paymentOptions: GymPaymentSetup[]
  wholeGymBooking?: WholeGymBookingSetup
}

const emptyValues: GymFormValues = {
  name: "",
  address: "",
  phone: "",
  imageUrl: "",
  status: "active",
}

type PaymentSetupDraft = {
  provider: PaymentProvider
  accountName: string
  accountNumber: string
  instructions: string
  qrCodeImageUrl: string
  qrCodeFileName: string
}

const emptyPaymentSetupDraft: PaymentSetupDraft = {
  provider: "GCash",
  accountName: "",
  accountNumber: "",
  instructions: "",
  qrCodeImageUrl: "",
  qrCodeFileName: "",
}

type WholeGymBookingDraft = {
  enabled: boolean
  pricePerHour: string
  availableSlots: string[]
  notes: string
}

const paymentProviderOptions: PaymentProvider[] = [
  "GCash",
  "Bank Transfer",
  "Maya",
  "Other",
]

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
          imageUrl: gym.imageUrl ?? "",
          status: gym.status,
          paymentOptions: gym.paymentOptions,
        }
      : { ...emptyValues, paymentOptions: [] }
  )
  const [paymentOptions, setPaymentOptions] = useState<PaymentSetupDraft[]>(
    gym?.paymentOptions?.length
      ? gym.paymentOptions.map((option) => ({
          provider: option.provider,
          accountName: option.accountName,
          accountNumber: option.accountNumber,
          instructions: option.instructions ?? "",
          qrCodeImageUrl: option.qrCodeImageUrl,
          qrCodeFileName: option.qrCodeFileName,
        }))
      : [{ ...emptyPaymentSetupDraft }]
  )
  const [wholeGymBooking, setWholeGymBooking] = useState<WholeGymBookingDraft>({
    enabled: gym?.wholeGymBooking?.enabled ?? false,
    pricePerHour: gym?.wholeGymBooking?.pricePerHour
      ? String(gym.wholeGymBooking.pricePerHour)
      : "",
    availableSlots: gym?.wholeGymBooking?.availableSlots ?? [],
    notes: gym?.wholeGymBooking?.notes ?? "",
  })
  const [wholeGymTimeRanges, setWholeGymTimeRanges] = useState(() =>
    createTimeRangeDrafts(gym?.wholeGymBooking?.availableSlots ?? [])
  )

  function updatePaymentOption(
    index: number,
    update: Partial<PaymentSetupDraft>
  ) {
    setPaymentOptions((current) =>
      current.map((option, currentIndex) =>
        currentIndex === index ? { ...option, ...update } : option
      )
    )
  }

  function handleQrUpload(index: number, file: File | undefined) {
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
        updatePaymentOption(index, {
          qrCodeFileName: file.name,
          qrCodeImageUrl: result,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  function handleGymImageUpload(file: File | undefined) {
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
    if (!values.name.trim() || !values.address.trim()) {
      return
    }
    const normalizedPaymentOptions = paymentOptions
      .filter(
        (option) =>
          option.accountName.trim() &&
          option.accountNumber.trim() &&
          option.qrCodeImageUrl
      )
      .map((option) => ({
        provider: option.provider,
        accountName: option.accountName.trim(),
        accountNumber: option.accountNumber.trim(),
        instructions: option.instructions.trim() || undefined,
        qrCodeImageUrl: option.qrCodeImageUrl,
        qrCodeFileName:
          option.qrCodeFileName ||
          `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${option.provider.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`,
      }))
    const wholeGymPrice = Number(wholeGymBooking.pricePerHour)
    const normalizedWholeGymSlots = normalizeTimeRanges(wholeGymTimeRanges)
    const wholeGymIsComplete =
      wholeGymBooking.enabled &&
      Number.isFinite(wholeGymPrice) &&
      wholeGymPrice > 0 &&
      normalizedWholeGymSlots.length > 0

    onSave({
      ...values,
      paymentOptions: normalizedPaymentOptions,
      wholeGymBooking: wholeGymIsComplete
        ? {
            enabled: true,
            pricePerHour: wholeGymPrice,
            availableSlots: normalizedWholeGymSlots,
            notes: wholeGymBooking.notes.trim() || undefined,
          }
        : undefined,
    })
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

        <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
          <div>
            <Label htmlFor="gym-image">Gym cover image</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a venue photo so owners and players can identify this gym
              faster in listings.
            </p>
          </div>
          <Input
            id="gym-image"
            type="file"
            accept="image/*"
            onChange={(event) => handleGymImageUpload(event.target.files?.[0])}
          />
          {values.imageUrl ? (
            <div className="grid gap-2 rounded-md border bg-background p-3">
              <img
                src={values.imageUrl}
                alt="Gym cover preview"
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

        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
          <div>
            <Label>Payment methods</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Owners can add multiple payment destinations so players can choose
              the best option during checkout.
            </p>
          </div>
          <div className="grid gap-3">
            {paymentOptions.map((paymentSetup, index) => (
              <div
                key={`${paymentSetup.provider}-${index}`}
                className="grid gap-3 rounded-lg border bg-background p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Payment option {index + 1}</span>
                  {paymentOptions.length > 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setPaymentOptions((current) =>
                          current.filter((_, currentIndex) => currentIndex !== index)
                        )
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`payment-provider-${index}`}>Payment mode</Label>
                  <select
                    id={`payment-provider-${index}`}
                    value={paymentSetup.provider}
                    onChange={(event) =>
                      updatePaymentOption(index, {
                        provider: event.target.value as PaymentProvider,
                      })
                    }
                    className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {paymentProviderOptions.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`payment-account-name-${index}`}>Account name</Label>
                  <Input
                    id={`payment-account-name-${index}`}
                    value={paymentSetup.accountName}
                    onChange={(event) =>
                      updatePaymentOption(index, {
                        accountName: event.target.value,
                      })
                    }
                    placeholder="Name shown on the QR account"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`payment-account-number-${index}`}>
                    Account number or handle
                  </Label>
                  <Input
                    id={`payment-account-number-${index}`}
                    value={paymentSetup.accountNumber}
                    onChange={(event) =>
                      updatePaymentOption(index, {
                        accountNumber: event.target.value,
                      })
                    }
                    placeholder="e.g. 0917..., bank account, or payment handle"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`payment-qr-${index}`}>Payment QR code</Label>
                  <Input
                    id={`payment-qr-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleQrUpload(index, event.target.files?.[0])
                    }
                  />
                  {paymentSetup.qrCodeImageUrl ? (
                    <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
                      <img
                        src={paymentSetup.qrCodeImageUrl}
                        alt="Payment QR code preview"
                        className="mx-auto aspect-square w-36 rounded-md border bg-white object-contain p-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {paymentSetup.qrCodeFileName}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`payment-instructions-${index}`}>
                    Payment instructions
                  </Label>
                  <textarea
                    id={`payment-instructions-${index}`}
                    value={paymentSetup.instructions}
                    onChange={(event) =>
                      updatePaymentOption(index, {
                        instructions: event.target.value,
                      })
                    }
                    placeholder="Optional note for players before they upload proof."
                    className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setPaymentOptions((current) => [
                ...current,
                { ...emptyPaymentSetupDraft, provider: "GCash" },
              ])
            }
          >
            Add payment method
          </Button>
        </div>

        <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
          <div>
            <Label>Whole gym booking</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Enable this when organizations can rent the entire venue instead
              of individual courts.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={wholeGymBooking.enabled ? "default" : "outline"}
              className={cn(wholeGymBooking.enabled && "pointer-events-none")}
              onClick={() =>
                setWholeGymBooking((current) => ({ ...current, enabled: true }))
              }
            >
              Enabled
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!wholeGymBooking.enabled ? "default" : "outline"}
              className={cn(!wholeGymBooking.enabled && "pointer-events-none")}
              onClick={() =>
                setWholeGymBooking((current) => ({
                  ...current,
                  enabled: false,
                }))
              }
            >
              Disabled
            </Button>
          </div>

          {wholeGymBooking.enabled ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="whole-gym-price">Whole gym price per hour ($)</Label>
                <Input
                  id="whole-gym-price"
                  type="number"
                  min="1"
                  step="1"
                  value={wholeGymBooking.pricePerHour}
                  onChange={(event) =>
                    setWholeGymBooking((current) => ({
                      ...current,
                      pricePerHour: event.target.value,
                    }))
                  }
                  placeholder="e.g. 40"
                />
              </div>

              <TimeRangeEditor
                label="Whole gym booking time windows"
                helperText="Add custom rental ranges for exclusive venue booking without being locked to fixed times."
                ranges={wholeGymTimeRanges}
                onChange={setWholeGymTimeRanges}
                addLabel="Add whole gym time window"
              />

              <div className="grid gap-2">
                <Label htmlFor="whole-gym-notes">Whole gym notes</Label>
                <textarea
                  id="whole-gym-notes"
                  value={wholeGymBooking.notes}
                  onChange={(event) =>
                    setWholeGymBooking((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional note for private organizations or corporate bookings."
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </>
          ) : null}
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
