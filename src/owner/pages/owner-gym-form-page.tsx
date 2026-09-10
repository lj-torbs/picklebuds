import { useEffect, useMemo, useRef, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  ImageUp,
  Package,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  createOwnerVenueWithApi,
  getOwnerVenuesWithApi,
  updateOwnerVenueWithApi,
} from "@/lib/owner-api"
import { OwnerWorkspaceHero } from "@/owner/components/layout/owner-workspace-hero"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import {
  mapOwnerPaymentMethodToGymPayment,
  paymentMethodMatchesGymPayment,
  useOwnerPaymentMethods,
} from "@/owner/lib/owner-payment-methods-context"
import { mapOwnerVenueToGym } from "@/owner/lib/owner-venue-mappers"
import { RentalGearEditor } from "@/shared/components/gyms/rental-gear-editor"
import type { RentalItemDraft } from "@/shared/components/gyms/rental-gear-utils"
import {
  rentalDraftIsComplete,
  rentalDraftIsEmpty,
} from "@/shared/components/gyms/rental-gear-utils"
import { TimeRangeEditor } from "@/shared/components/gyms/time-range-editor"
import {
  createTimeRangeDrafts,
  normalizeTimeRanges,
} from "@/shared/components/gyms/time-range-utils"
import type {
  GymPaymentSetup,
  GymStatus,
  RentalItem,
} from "@/shared/lib/gyms-context"
import type { Gym } from "@/shared/lib/gyms-context"

type DetailsDraft = {
  name: string
  address: string
  phone: string
  imageUrl: string
  status: GymStatus
}

type WholeGymDraft = {
  enabled: boolean
  pricePerHour: string
  notes: string
}

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
      "Choose from reusable owner payment methods for this venue and its courts.",
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
  {
    id: "gear",
    title: "Gear rental",
    shortTitle: "Gear",
    description:
      "Optional: paddles, balls, and other equipment players can add to a booking.",
    icon: Package,
  },
] as const

function readImageFile(
  file: File | undefined,
  onLoad: (dataUrl: string) => void
) {
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

export function OwnerGymFormPage() {
  const { gymId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { owner } = useOwnerAuth()
  const { activePaymentMethods } = useOwnerPaymentMethods()
  const [availableGyms, setAvailableGyms] = useState<Gym[]>([])
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [hasLoadedGyms, setHasLoadedGyms] = useState(false)

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
        setAvailableGyms(items.map(mapOwnerVenueToGym))
        setLoadingError(null)
        setHasLoadedGyms(true)
      })
      .catch((error) => {
        if (!isActive) {
          return
        }
        setLoadingError(
          error instanceof Error
            ? error.message
            : "Unable to load owner venues."
        )
        setHasLoadedGyms(true)
      })

    return () => {
      isActive = false
    }
  }, [owner?.token])

  const editingGym = useMemo(
    () =>
      gymId ? (availableGyms.find((gym) => gym.id === gymId) ?? null) : null,
    [availableGyms, gymId]
  )

  const isEditing = Boolean(gymId)
  const canEdit =
    !isEditing ||
    !hasLoadedGyms ||
    (editingGym && editingGym.ownerId === owner?.id)

  const [stepIndex, setStepIndex] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const hydratedGymIdRef = useRef<string | null>(null)

  const [details, setDetails] = useState<DetailsDraft>({
    name: editingGym?.name ?? "",
    address: editingGym?.address ?? "",
    phone: editingGym?.phone ?? "",
    imageUrl: editingGym?.imageUrl ?? "",
    status: editingGym?.status ?? "active",
  })

  const [paymentOptions, setPaymentOptions] = useState<GymPaymentSetup[]>(
    editingGym?.paymentOptions ?? []
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

  const [rentalItems, setRentalItems] = useState<RentalItemDraft[]>(() =>
    (editingGym?.rentalItems ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      pricePerSession: String(item.pricePerSession),
      quantityAvailable: String(item.quantityAvailable),
      status: item.status,
      description: item.description ?? "",
    }))
  )

  useEffect(() => {
    if (!editingGym || hydratedGymIdRef.current === editingGym.id) {
      return
    }

    setDetails({
      name: editingGym.name,
      address: editingGym.address,
      phone: editingGym.phone ?? "",
      imageUrl: editingGym.imageUrl ?? "",
      status: editingGym.status,
    })
    setPaymentOptions(editingGym.paymentOptions)
    setWholeGym({
      enabled: editingGym.wholeGymBooking?.enabled ?? false,
      pricePerHour: editingGym.wholeGymBooking?.pricePerHour
        ? String(editingGym.wholeGymBooking.pricePerHour)
        : "",
      notes: editingGym.wholeGymBooking?.notes ?? "",
    })
    setWholeGymTimeRanges(
      createTimeRangeDrafts(editingGym.wholeGymBooking?.availableSlots ?? [])
    )
    setRentalItems(
      editingGym.rentalItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        pricePerSession: String(item.pricePerSession),
        quantityAvailable: String(item.quantityAvailable),
        status: item.status,
        description: item.description ?? "",
      }))
    )
    hydratedGymIdRef.current = editingGym.id
  }, [editingGym])

  // An owner opening someone else's gym, or a stale /edit link, goes back to the list.
  if (!canEdit) {
    return <Navigate to="/owner/gyms" replace />
  }

  const detailsErrors = {
    name: !details.name.trim(),
    address: !details.address.trim(),
  }
  const detailsAreValid = !detailsErrors.name && !detailsErrors.address

  const completePayments = paymentOptions.length

  const droppedRentals = rentalItems.filter(
    (item) => !rentalDraftIsComplete(item) && !rentalDraftIsEmpty(item)
  ).length
  const completeRentals = rentalItems.filter(rentalDraftIsComplete).length

  const wholeGymPrice = Number(wholeGym.pricePerHour)
  const normalizedWholeGymSlots = normalizeTimeRanges(wholeGymTimeRanges)
  const wholeGymIsComplete =
    wholeGym.enabled &&
    Number.isFinite(wholeGymPrice) &&
    wholeGymPrice > 0 &&
    normalizedWholeGymSlots.length > 0

  function toggleAssignedPaymentMethod(methodId: string) {
    const method = activePaymentMethods.find((item) => item.id === methodId)
    if (!method) {
      return
    }

    setPaymentOptions((current) => {
      const assigned = current.some((option) =>
        paymentMethodMatchesGymPayment(method, option)
      )

      return assigned
        ? current.filter(
            (option) => !paymentMethodMatchesGymPayment(method, option)
          )
        : [...current, mapOwnerPaymentMethodToGymPayment(method)]
    })
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

  async function handleSubmit() {
    if (!detailsAreValid) {
      setShowErrors(true)
      setStepIndex(0)
      return
    }

    if (!owner?.id) {
      return
    }

    const normalizedPaymentOptions: GymPaymentSetup[] = paymentOptions.map(
      (option) => ({
        provider: option.provider,
        accountName: option.accountName.trim(),
        accountNumber: option.accountNumber.trim(),
        instructions: option.instructions?.trim() || undefined,
        qrCodeImageUrl: option.qrCodeImageUrl,
        qrCodeFileName:
          option.qrCodeFileName ||
          `${details.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${option.provider
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-qr.png`,
      })
    )

    const normalizedRentalItems: RentalItem[] = rentalItems
      .filter(rentalDraftIsComplete)
      .map((item, index) => ({
        // Existing items keep their id so bookings that reference them still line up.
        id:
          item.id ||
          `${details.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-gear-${index}-${Date.now().toString(36)}`,
        name: item.name.trim(),
        category: item.category,
        pricePerSession: Number(item.pricePerSession),
        quantityAvailable: Number(item.quantityAvailable),
        status: item.status,
        description: item.description.trim() || undefined,
      }))

    const values = {
      name: details.name.trim(),
      address: details.address.trim(),
      phone: details.phone.trim(),
      imageUrl: details.imageUrl || undefined,
      status: details.status,
      paymentOptions: normalizedPaymentOptions,
      rentalItems: normalizedRentalItems,
      wholeGymBooking: wholeGymIsComplete
        ? {
            enabled: true,
            pricePerHour: wholeGymPrice,
            availableSlots: normalizedWholeGymSlots,
            notes: wholeGym.notes.trim() || undefined,
          }
        : undefined,
    }

    try {
      if (editingGym) {
        await updateOwnerVenueWithApi(owner.token!, editingGym.id, values)
        toast.add({
          title: "Gym updated",
          description: `${values.name} has been updated.`,
          type: "success",
        })
      } else {
        await createOwnerVenueWithApi(owner.token!, values)
        toast.add({
          title: "Gym added",
          description: `${values.name} is now part of your venues.`,
          type: "success",
        })
      }

      navigate("/owner/gyms")
    } catch (error) {
      toast.add({
        title: "Unable to save gym",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    }
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

        <OwnerWorkspaceHero
          eyebrow="Venues"
          title={editingGym ? `Edit ${editingGym.name}` : "Add a venue"}
          description={
            editingGym
              ? "Update venue details, payment collection, and whole gym availability inside your branded owner workspace."
              : "Set up a new venue, assign saved payment methods, and configure exclusive venue booking before courts are added."
          }
          meta={editingGym ? "Edit venue" : "New venue"}
        />
        {loadingError ? (
          <p className="text-sm text-destructive">{loadingError}</p>
        ) : null}
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
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isComplete &&
                      "border-primary/40 bg-primary/10 text-primary",
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
          if (isEditing || isLastStep) {
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
                  <p className="text-xs text-destructive">
                    A gym name is required.
                  </p>
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
                  <p className="text-xs text-destructive">
                    An address is required.
                  </p>
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
                      variant={
                        details.status === status ? "default" : "outline"
                      }
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
                          setDetails((current) => ({
                            ...current,
                            imageUrl: "",
                          }))
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
                      A venue photo helps players recognise this gym in
                      listings.
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
                      setDetails((current) => ({
                        ...current,
                        imageUrl: dataUrl,
                      }))
                    )
                  }
                />
              </div>
            </div>
          </div>
        ) : null}

        {stepIndex === 1 ? (
          <div className="grid gap-4">
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    Assign saved payment methods
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Payment account details are managed separately, then reused
                    here for this venue and its courts.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/owner/payment-methods")}
                >
                  Manage payment methods
                </Button>
              </div>
            </div>

            {activePaymentMethods.length === 0 ? (
              <div className="grid gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                <p>
                  No active reusable payment methods yet. Add one before
                  assigning payment collection to this gym.
                </p>
                <Button
                  type="button"
                  className="w-fit"
                  onClick={() => navigate("/owner/payment-methods")}
                >
                  Add reusable method
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {activePaymentMethods.map((method) => {
                  const assigned = paymentOptions.some((option) =>
                    paymentMethodMatchesGymPayment(method, option)
                  )

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => toggleAssignedPaymentMethod(method.id)}
                      className={cn(
                        "grid gap-3 rounded-lg border bg-background p-4 text-left transition hover:border-primary/50 hover:bg-primary/5",
                        assigned &&
                          "border-primary bg-primary/5 ring-1 ring-primary/25"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {method.displayName}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {method.provider} / {method.accountName}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {method.accountNumber}
                          </p>
                        </div>
                        {assigned ? (
                          <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                            Assigned
                          </span>
                        ) : (
                          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CreditCard className="size-3.5" aria-hidden="true" />
                        QR: {method.qrCodeFileName}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="grid gap-2">
              <p className="text-sm font-medium">
                Assigned to this venue ({paymentOptions.length})
              </p>
              {paymentOptions.length === 0 ? (
                <p className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
                  No payment methods assigned. Players will not see a payment QR
                  at checkout for this venue.
                </p>
              ) : (
                <div className="grid gap-2">
                  {paymentOptions.map((paymentSetup, index) => (
                    <div
                      key={`${paymentSetup.provider}-${paymentSetup.accountNumber}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {paymentSetup.provider} / {paymentSetup.accountName}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {paymentSetup.accountNumber}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
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

        {stepIndex === 3 ? (
          <div className="grid gap-4">
            {droppedRentals > 0 ? (
              <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <TriangleAlert
                  className="mt-px size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {droppedRentals} gear{" "}
                  {droppedRentals === 1 ? "item is" : "items are"} incomplete
                  and {droppedRentals === 1 ? "won't" : "won't"} be saved.
                </span>
              </p>
            ) : null}

            <RentalGearEditor items={rentalItems} onChange={setRentalItems} />
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {completePayments > 0
              ? `${completePayments} payment ${completePayments === 1 ? "method" : "methods"} ready`
              : "No payment methods set up yet"}
            {wholeGymIsComplete ? " · whole gym booking on" : null}
            {completeRentals > 0
              ? ` · ${completeRentals} gear ${completeRentals === 1 ? "item" : "items"}`
              : null}
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
            {isEditing ? (
              <Button type="submit">Save changes</Button>
            ) : (
              <>
                {isLastStep ? (
                  <Button type="submit">Add gym</Button>
                ) : (
                  <Button type="submit">
                    Next: {steps[stepIndex + 1].shortTitle}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
