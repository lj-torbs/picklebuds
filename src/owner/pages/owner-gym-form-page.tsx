import { useMemo, useRef, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  ImageUp,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { TimeRangeEditor } from "@/shared/components/gyms/time-range-editor"
import {
  createTimeRangeDrafts,
  normalizeTimeRanges,
} from "@/shared/components/gyms/time-range-utils"
import type {
  GymPaymentSetup,
  GymStatus,
  PaymentProvider,
} from "@/shared/lib/gyms-context"
import { useGyms } from "@/shared/lib/gyms-context"

type DetailsDraft = {
  name: string
  address: string
  phone: string
  imageUrl: string
  status: GymStatus
}

type PaymentSetupDraft = {
  provider: PaymentProvider
  accountName: string
  accountNumber: string
  instructions: string
  qrCodeImageUrl: string
  qrCodeFileName: string
}

type WholeGymDraft = {
  enabled: boolean
  pricePerHour: string
  notes: string
}

const emptyPaymentSetupDraft: PaymentSetupDraft = {
  provider: "GCash",
  accountName: "",
  accountNumber: "",
  instructions: "",
  qrCodeImageUrl: "",
  qrCodeFileName: "",
}

const paymentProviderOptions: PaymentProvider[] = [
  "GCash",
  "Bank Transfer",
  "Maya",
  "Other",
]

const steps = [
  {
    id: "details",
    title: "Venue details",
    shortTitle: "Details",
    description: "Name, location, and how this venue appears to players.",
    icon: Building2,
  },
  {
    id: "payments",
    title: "Payment methods",
    shortTitle: "Payments",
    description:
      "Where players send payment, and the QR codes they scan at checkout.",
    icon: CreditCard,
  },
  {
    id: "whole-gym",
    title: "Whole gym booking",
    shortTitle: "Whole gym",
    description:
      "Optional: let organizations rent the entire venue instead of single courts.",
    icon: Users,
  },
] as const

function readImageFile(file: File | undefined, onLoad: (dataUrl: string) => void) {
  if (!file || !file.type.startsWith("image/")) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === "string") {
      onLoad(reader.result)
    }
  }
  reader.readAsDataURL(file)
}

function paymentIsComplete(option: PaymentSetupDraft) {
  return Boolean(
    option.accountName.trim() && option.accountNumber.trim() && option.qrCodeImageUrl
  )
}

function paymentIsEmpty(option: PaymentSetupDraft) {
  return !(
    option.accountName.trim() ||
    option.accountNumber.trim() ||
    option.qrCodeImageUrl ||
    option.instructions.trim()
  )
}

export function OwnerGymFormPage() {
  const { gymId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { owner } = useOwnerAuth()
  const { gyms, addGym, updateGym } = useGyms()

  const editingGym = useMemo(
    () => (gymId ? (gyms.find((gym) => gym.id === gymId) ?? null) : null),
    [gyms, gymId]
  )

  const isEditing = Boolean(gymId)
  const canEdit = !isEditing || (editingGym && editingGym.ownerId === owner?.id)

  const [stepIndex, setStepIndex] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [details, setDetails] = useState<DetailsDraft>({
    name: editingGym?.name ?? "",
    address: editingGym?.address ?? "",
    phone: editingGym?.phone ?? "",
    imageUrl: editingGym?.imageUrl ?? "",
    status: editingGym?.status ?? "active",
  })

  const [paymentOptions, setPaymentOptions] = useState<PaymentSetupDraft[]>(
    editingGym?.paymentOptions?.length
      ? editingGym.paymentOptions.map((option) => ({
          provider: option.provider,
          accountName: option.accountName,
          accountNumber: option.accountNumber,
          instructions: option.instructions ?? "",
          qrCodeImageUrl: option.qrCodeImageUrl,
          qrCodeFileName: option.qrCodeFileName,
        }))
      : [{ ...emptyPaymentSetupDraft }]
  )

  const [wholeGym, setWholeGym] = useState<WholeGymDraft>({
    enabled: editingGym?.wholeGymBooking?.enabled ?? false,
    pricePerHour: editingGym?.wholeGymBooking?.pricePerHour
      ? String(editingGym.wholeGymBooking.pricePerHour)
      : "",
    notes: editingGym?.wholeGymBooking?.notes ?? "",
  })

  const [wholeGymTimeRanges, setWholeGymTimeRanges] = useState(() =>
    createTimeRangeDrafts(editingGym?.wholeGymBooking?.availableSlots ?? [])
  )

  // An owner opening someone else's gym, or a stale /edit link, goes back to the list.
  if (!canEdit) {
    return <Navigate to="/owner/gyms" replace />
  }

  const detailsErrors = {
    name: !details.name.trim(),
    address: !details.address.trim(),
  }
  const detailsAreValid = !detailsErrors.name && !detailsErrors.address

  const droppedPayments = paymentOptions.filter(
    (option) => !paymentIsComplete(option) && !paymentIsEmpty(option)
  ).length
  const completePayments = paymentOptions.filter(paymentIsComplete).length

  const wholeGymPrice = Number(wholeGym.pricePerHour)
  const normalizedWholeGymSlots = normalizeTimeRanges(wholeGymTimeRanges)
  const wholeGymIsComplete =
    wholeGym.enabled &&
    Number.isFinite(wholeGymPrice) &&
    wholeGymPrice > 0 &&
    normalizedWholeGymSlots.length > 0

  function updatePaymentOption(index: number, update: Partial<PaymentSetupDraft>) {
    setPaymentOptions((current) =>
      current.map((option, currentIndex) =>
        currentIndex === index ? { ...option, ...update } : option
      )
    )
  }

  function goToStep(nextIndex: number) {
    // Details gate every later step, since a venue needs a name and address.
    if (nextIndex > 0 && !detailsAreValid) {
      setShowErrors(true)
      setStepIndex(0)
      return
    }

    setShowErrors(false)
    setStepIndex(nextIndex)
  }

  function handleSubmit() {
    if (!detailsAreValid) {
      setShowErrors(true)
      setStepIndex(0)
      return
    }

    if (!owner?.id) {
      return
    }

    const normalizedPaymentOptions: GymPaymentSetup[] = paymentOptions
      .filter(paymentIsComplete)
      .map((option) => ({
        provider: option.provider,
        accountName: option.accountName.trim(),
        accountNumber: option.accountNumber.trim(),
        instructions: option.instructions.trim() || undefined,
        qrCodeImageUrl: option.qrCodeImageUrl,
        qrCodeFileName:
          option.qrCodeFileName ||
          `${details.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${option.provider
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-qr.png`,
      }))

    const values = {
      name: details.name.trim(),
      address: details.address.trim(),
      phone: details.phone.trim(),
      imageUrl: details.imageUrl || undefined,
      status: details.status,
      paymentOptions: normalizedPaymentOptions,
      wholeGymBooking: wholeGymIsComplete
        ? {
            enabled: true,
            pricePerHour: wholeGymPrice,
            availableSlots: normalizedWholeGymSlots,
            notes: wholeGym.notes.trim() || undefined,
          }
        : undefined,
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

    navigate("/owner/gyms")
  }

  const activeStep = steps[stepIndex]
  const isLastStep = stepIndex === steps.length - 1

  return (
    <div className="mx-auto grid w-full max-w-5xl min-w-0 gap-6 pb-4">
      <div className="grid gap-4">
        <Link
          to="/owner/gyms"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to my gyms
        </Link>

        <div>
          <p className="text-sm font-medium text-primary">Venues</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {editingGym ? `Edit ${editingGym.name}` : "Add a venue"}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {editingGym
              ? "Update this venue's details, payment collection, and whole gym availability."
              : "Set up your venue in three steps. You can add courts once the venue is saved."}
          </p>
        </div>
      </div>

      <ol className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[repeat(3,minmax(0,1fr))]">
        {steps.map((step, index) => {
          const isComplete = index < stepIndex
          const isCurrent = index === stepIndex
          const StepIcon = step.icon

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => goToStep(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex w-full min-w-0 items-center gap-3 rounded-md border p-3 text-left transition-colors",
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isComplete && "border-primary/40 bg-primary/10 text-primary",
                    !isCurrent && !isComplete && "text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <StepIcon className="size-4" aria-hidden="true" />
                  )}
                </span>
                <span className="grid min-w-0">
                  <span className="text-xs text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.shortTitle}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <form
        className="grid min-w-0 gap-6 rounded-lg border bg-card p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (isLastStep) {
            handleSubmit()
          } else {
            goToStep(stepIndex + 1)
          }
        }}
      >
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {activeStep.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeStep.description}
          </p>
        </div>

        {stepIndex === 0 ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="grid content-start gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gym-name">Gym name</Label>
                <Input
                  id="gym-name"
                  value={details.name}
                  aria-invalid={showErrors && detailsErrors.name}
                  onChange={(event) =>
                    setDetails((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Northside Pickleball Club"
                />
                {showErrors && detailsErrors.name ? (
                  <p className="text-xs text-destructive">A gym name is required.</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gym-address">Address</Label>
                <Input
                  id="gym-address"
                  value={details.address}
                  aria-invalid={showErrors && detailsErrors.address}
                  onChange={(event) =>
                    setDetails((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Street, barangay, city"
                />
                {showErrors && detailsErrors.address ? (
                  <p className="text-xs text-destructive">An address is required.</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gym-phone">Phone</Label>
                <Input
                  id="gym-phone"
                  value={details.phone}
                  onChange={(event) =>
                    setDetails((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="e.g. 0917 123 4567"
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
                      variant={details.status === status ? "default" : "outline"}
                      className="capitalize"
                      onClick={() =>
                        setDetails((current) => ({ ...current, status }))
                      }
                    >
                      {status}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Inactive venues stay in your dashboard but are hidden from
                  players browsing for courts.
                </p>
              </div>
            </div>

            <div className="grid content-start gap-2">
              <Label htmlFor="gym-image">Cover image</Label>
              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragActive(false)
                  readImageFile(event.dataTransfer.files?.[0], (dataUrl) =>
                    setDetails((current) => ({ ...current, imageUrl: dataUrl }))
                  )
                }}
                className={cn(
                  "grid gap-3 rounded-lg border border-dashed p-3 transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "bg-muted/30"
                )}
              >
                {details.imageUrl ? (
                  <>
                    <img
                      src={details.imageUrl}
                      alt="Gym cover preview"
                      className="aspect-[16/9] w-full rounded-md border object-cover"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          setDetails((current) => ({ ...current, imageUrl: "" }))
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Remove
                      </Button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex min-h-40 w-full min-w-0 flex-col items-center justify-center gap-2 rounded-md px-3 py-6 text-center"
                  >
                    <ImageUp
                      className="size-7 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="w-full text-sm font-medium">
                      Drop a photo, or click to upload
                    </span>
                    <span className="w-full text-xs text-muted-foreground">
                      A venue photo helps players recognise this gym in listings.
                    </span>
                  </button>
                )}
                <input
                  id="gym-image"
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) =>
                    readImageFile(event.target.files?.[0], (dataUrl) =>
                      setDetails((current) => ({ ...current, imageUrl: dataUrl }))
                    )
                  }
                />
              </div>
            </div>
          </div>
        ) : null}

        {stepIndex === 1 ? (
          <div className="grid gap-4">
            {droppedPayments > 0 ? (
              <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <TriangleAlert
                  className="mt-px size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {droppedPayments} payment{" "}
                  {droppedPayments === 1 ? "method is" : "methods are"} missing an
                  account name, account number, or QR code, and{" "}
                  {droppedPayments === 1 ? "it won't" : "they won't"} be saved.
                </span>
              </p>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
              {paymentOptions.map((paymentSetup, index) => (
                <div
                  key={index}
                  className="grid min-w-0 content-start gap-3 rounded-lg border bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      Payment option {index + 1}
                    </span>
                    {paymentOptions.length > 1 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setPaymentOptions((current) =>
                            current.filter(
                              (_, currentIndex) => currentIndex !== index
                            )
                          )
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Remove
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`payment-provider-${index}`}>
                      Payment mode
                    </Label>
                    <select
                      id={`payment-provider-${index}`}
                      value={paymentSetup.provider}
                      onChange={(event) =>
                        updatePaymentOption(index, {
                          provider: event.target.value as PaymentProvider,
                        })
                      }
                      className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {paymentProviderOptions.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`payment-account-name-${index}`}>
                      Account name
                    </Label>
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
                        readImageFile(event.target.files?.[0], (dataUrl) =>
                          updatePaymentOption(index, {
                            qrCodeFileName:
                              event.target.files?.[0]?.name ?? "qr-code.png",
                            qrCodeImageUrl: dataUrl,
                          })
                        )
                      }
                    />
                    {paymentSetup.qrCodeImageUrl ? (
                      <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
                        <img
                          src={paymentSetup.qrCodeImageUrl}
                          alt="Payment QR code preview"
                          className="mx-auto aspect-square w-36 rounded-md border bg-white object-contain p-2"
                        />
                        <span className="text-center text-xs text-muted-foreground">
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
                      className="min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() =>
                setPaymentOptions((current) => [
                  ...current,
                  { ...emptyPaymentSetupDraft },
                ])
              }
            >
              Add payment method
            </Button>
          </div>
        ) : null}

        {stepIndex === 2 ? (
          <div className="grid gap-4">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={wholeGym.enabled ? "default" : "outline"}
                onClick={() =>
                  setWholeGym((current) => ({ ...current, enabled: true }))
                }
              >
                Enabled
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!wholeGym.enabled ? "default" : "outline"}
                onClick={() =>
                  setWholeGym((current) => ({ ...current, enabled: false }))
                }
              >
                Disabled
              </Button>
            </div>

            {wholeGym.enabled ? (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                  <div className="grid gap-2">
                    <Label htmlFor="whole-gym-price">
                      Whole gym price per hour
                    </Label>
                    <Input
                      id="whole-gym-price"
                      type="number"
                      min="1"
                      step="1"
                      value={wholeGym.pricePerHour}
                      onChange={(event) =>
                        setWholeGym((current) => ({
                          ...current,
                          pricePerHour: event.target.value,
                        }))
                      }
                      placeholder="e.g. 2500"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="whole-gym-notes">Whole gym notes</Label>
                    <textarea
                      id="whole-gym-notes"
                      value={wholeGym.notes}
                      onChange={(event) =>
                        setWholeGym((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Optional note for private organizations or corporate bookings."
                      className="min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <TimeRangeEditor
                    label="Whole gym booking time windows"
                    helperText="Add custom rental ranges for exclusive venue booking without being locked to fixed times."
                    ranges={wholeGymTimeRanges}
                    onChange={setWholeGymTimeRanges}
                    addLabel="Add whole gym time window"
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Whole gym booking is off. Players will only be able to reserve
                individual courts at this venue.
              </p>
            )}

            {wholeGym.enabled && !wholeGymIsComplete ? (
              <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <TriangleAlert
                  className="mt-px size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Whole gym booking needs a price above 0 and at least one valid
                  time window, otherwise it won't be saved.
                </span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {completePayments > 0
              ? `${completePayments} payment ${completePayments === 1 ? "method" : "methods"} ready`
              : "No payment methods set up yet"}
            {wholeGymIsComplete ? " · whole gym booking on" : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/owner/gyms")}
            >
              Cancel
            </Button>
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep(stepIndex - 1)}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </Button>
            ) : null}
            {isLastStep ? (
              <Button type="submit">
                {editingGym ? "Save changes" : "Add gym"}
              </Button>
            ) : (
              <Button type="submit">
                Next: {steps[stepIndex + 1].shortTitle}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
