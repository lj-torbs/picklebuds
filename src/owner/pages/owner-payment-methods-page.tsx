import { useMemo, useState, type ChangeEvent } from "react"
import {
  ChevronDown,
  CheckCircle2,
  EyeOff,
  Plus,
  QrCode,
  Save,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import {
  type OwnerPaymentMethod,
  type OwnerPaymentMethodInput,
  useOwnerPaymentMethods,
} from "@/owner/lib/owner-payment-methods-context"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import type { PaymentProvider } from "@/shared/lib/gyms-context"

type PaymentMethodDraft = {
  provider: PaymentProvider
  displayName: string
  accountName: string
  accountNumber: string
  instructions: string
  qrCodeImageUrl: string
  qrCodeFileName: string
}

type PaymentModeOption = {
  id: string
  provider: PaymentProvider
  label: string
  shortLabel: string
  description: string
  markClassName: string
}

const paymentModeOptions: PaymentModeOption[] = [
  {
    id: "gcash",
    provider: "GCash",
    label: "GCash",
    shortLabel: "G",
    description: "Mobile wallet",
    markClassName: "bg-sky-600 text-white",
  },
  {
    id: "maya",
    provider: "Maya",
    label: "Maya",
    shortLabel: "M",
    description: "Mobile wallet",
    markClassName: "bg-emerald-600 text-white",
  },
  {
    id: "maribank",
    provider: "Bank Transfer",
    label: "MariBank",
    shortLabel: "MB",
    description: "Bank transfer",
    markClassName: "bg-orange-500 text-white",
  },
  {
    id: "bdo",
    provider: "Bank Transfer",
    label: "BDO",
    shortLabel: "BDO",
    description: "Bank transfer",
    markClassName: "bg-blue-700 text-white",
  },
  {
    id: "bpi",
    provider: "Bank Transfer",
    label: "BPI",
    shortLabel: "BPI",
    description: "Bank transfer",
    markClassName: "bg-red-700 text-white",
  },
  {
    id: "metrobank",
    provider: "Bank Transfer",
    label: "Metrobank",
    shortLabel: "MBT",
    description: "Bank transfer",
    markClassName: "bg-blue-600 text-white",
  },
  {
    id: "unionbank",
    provider: "Bank Transfer",
    label: "UnionBank",
    shortLabel: "UB",
    description: "Bank transfer",
    markClassName: "bg-amber-500 text-slate-950",
  },
  {
    id: "bank-transfer",
    provider: "Bank Transfer",
    label: "Bank Transfer",
    shortLabel: "BT",
    description: "Generic bank account",
    markClassName: "bg-slate-700 text-white",
  },
  {
    id: "other",
    provider: "Other",
    label: "Other",
    shortLabel: "O",
    description: "Custom payment mode",
    markClassName: "bg-muted text-foreground",
  },
]

const emptyDraft: PaymentMethodDraft = {
  provider: "GCash",
  displayName: "",
  accountName: "",
  accountNumber: "",
  instructions: "",
  qrCodeImageUrl: "",
  qrCodeFileName: "",
}

function getPaymentModeLabelCandidate(method: {
  displayName?: string
  accountNumber?: string
  provider: PaymentProvider
}) {
  return `${method.displayName ?? ""} ${method.accountNumber ?? ""} ${
    method.provider
  }`.toLowerCase()
}

function resolvePaymentModeOption(method: {
  displayName?: string
  accountNumber?: string
  provider: PaymentProvider
}) {
  const candidate = getPaymentModeLabelCandidate(method)
  const exactBankMatch = paymentModeOptions.find(
    (option) =>
      option.provider === "Bank Transfer" &&
      option.id !== "bank-transfer" &&
      candidate.includes(option.label.toLowerCase())
  )

  if (exactBankMatch) {
    return exactBankMatch
  }

  return (
    paymentModeOptions.find((option) => option.provider === method.provider) ??
    paymentModeOptions[paymentModeOptions.length - 1]
  )
}

function PaymentModeMark({
  option,
  className,
}: {
  option: PaymentModeOption
  className?: string
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${option.markClassName} ${className ?? "size-9"}`}
    >
      {option.shortLabel}
    </span>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Unable to read the selected file."))
    }

    reader.onerror = () => {
      reject(new Error("Unable to read the selected file."))
    }

    reader.readAsDataURL(file)
  })
}

export function OwnerPaymentMethodsPage() {
  const toast = useToast()
  const { owner } = useOwnerAuth()
  const {
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
    togglePaymentMethodStatus,
  } = useOwnerPaymentMethods()
  const [draft, setDraft] = useState<PaymentMethodDraft>(emptyDraft)
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null)
  const [showQrForMethodId, setShowQrForMethodId] = useState<string | null>(
    null
  )
  const [showErrors, setShowErrors] = useState(false)
  const [selectedPaymentModeId, setSelectedPaymentModeId] = useState("gcash")
  const [paymentModePickerOpen, setPaymentModePickerOpen] = useState(false)

  const editingMethod = useMemo(
    () =>
      editingMethodId
        ? (paymentMethods.find((method) => method.id === editingMethodId) ??
          null)
        : null,
    [editingMethodId, paymentMethods]
  )
  const selectedPaymentMode =
    paymentModeOptions.find((option) => option.id === selectedPaymentModeId) ??
    paymentModeOptions[0]

  const draftIsValid =
    draft.displayName.trim() &&
    draft.accountName.trim() &&
    draft.accountNumber.trim() &&
    draft.qrCodeImageUrl

  function updateDraft(update: Partial<PaymentMethodDraft>) {
    setDraft((current) => ({ ...current, ...update }))
  }

  async function handleQrChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      updateDraft({
        qrCodeFileName: file.name,
        qrCodeImageUrl: await readFileAsDataUrl(file),
      })
    } catch (error) {
      toast.add({
        title: "Unable to read QR code",
        description:
          error instanceof Error ? error.message : "Please try another image.",
        type: "error",
      })
    }

    event.target.value = ""
  }

  function resetDraft() {
    setDraft(emptyDraft)
    setEditingMethodId(null)
    setShowErrors(false)
    setSelectedPaymentModeId("gcash")
    setPaymentModePickerOpen(false)
  }

  function handleEdit(method: OwnerPaymentMethod) {
    const resolvedOption = resolvePaymentModeOption(method)
    setEditingMethodId(method.id)
    setShowErrors(false)
    setSelectedPaymentModeId(resolvedOption.id)
    setPaymentModePickerOpen(false)
    setDraft({
      provider: method.provider,
      displayName: method.displayName,
      accountName: method.accountName,
      accountNumber: method.accountNumber,
      instructions: method.instructions ?? "",
      qrCodeImageUrl: method.qrCodeImageUrl,
      qrCodeFileName: method.qrCodeFileName,
    })
  }

  function handlePaymentModeSelect(option: PaymentModeOption) {
    const previousOption = selectedPaymentMode

    setSelectedPaymentModeId(option.id)
    setPaymentModePickerOpen(false)
    setDraft((current) => {
      const displayName = current.displayName.trim()
      const shouldUseOptionName =
        !displayName || displayName === previousOption.label

      return {
        ...current,
        provider: option.provider,
        displayName: shouldUseOptionName ? option.label : current.displayName,
      }
    })
  }

  function handleSave() {
    if (!draftIsValid) {
      setShowErrors(true)
      return
    }

    const input: OwnerPaymentMethodInput = {
      provider: draft.provider,
      displayName: draft.displayName.trim(),
      accountName: draft.accountName.trim(),
      accountNumber: draft.accountNumber.trim(),
      instructions: draft.instructions.trim() || undefined,
      qrCodeImageUrl: draft.qrCodeImageUrl,
      qrCodeFileName: draft.qrCodeFileName,
      isActive: editingMethod?.isActive ?? true,
    }

    if (editingMethodId) {
      updatePaymentMethod(editingMethodId, input)
    } else {
      addPaymentMethod(input)
    }

    toast.add({
      title: editingMethodId
        ? "Payment method updated"
        : "Payment method added",
      description:
        "This payment method is now available when assigning payments to your gyms.",
      type: "success",
    })
    resetDraft()
  }

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Payments</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Payment methods
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Set up reusable QR codes and account details once, then assign them
            to the gyms and courts you manage.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={resetDraft}>
          <Plus className="size-4" aria-hidden="true" />
          New method
        </Button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">
              {editingMethodId ? "Edit payment method" : "Add payment method"}
            </CardTitle>
            <CardDescription>
              Only active methods can be assigned to a gym.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-display-name">Method name</Label>
              <Input
                id="payment-display-name"
                value={draft.displayName}
                aria-invalid={showErrors && !draft.displayName.trim()}
                onChange={(event) =>
                  updateDraft({ displayName: event.target.value })
                }
                placeholder="e.g. Main GCash, BDO Corporate"
              />
              {showErrors && !draft.displayName.trim() ? (
                <p className="text-xs text-destructive">
                  Method name is required.
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-provider">Payment mode</Label>
              <div className="relative">
                <button
                  id="payment-provider"
                  type="button"
                  onClick={() => setPaymentModePickerOpen((current) => !current)}
                  className="flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-haspopup="listbox"
                  aria-expanded={paymentModePickerOpen}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <PaymentModeMark option={selectedPaymentMode} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {selectedPaymentMode.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {selectedPaymentMode.description}
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition ${paymentModePickerOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {paymentModePickerOpen ? (
                  <div
                    role="listbox"
                    aria-label="Payment mode"
                    className="absolute z-30 mt-2 grid max-h-72 w-full gap-1 overflow-y-auto rounded-lg border bg-popover p-1.5 shadow-lg"
                  >
                    {paymentModeOptions.map((option) => {
                      const selected = option.id === selectedPaymentMode.id

                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => handlePaymentModeSelect(option)}
                          className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition hover:bg-muted ${selected ? "bg-primary/10 text-primary" : ""}`}
                        >
                          <PaymentModeMark
                            option={option}
                            className="size-8"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {option.label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                          {selected ? (
                            <CheckCircle2
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Bank brands are saved as bank transfers while the method name
                keeps the exact bank label.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="payment-account-name">Account name</Label>
                <Input
                  id="payment-account-name"
                  value={draft.accountName}
                  aria-invalid={showErrors && !draft.accountName.trim()}
                  onChange={(event) =>
                    updateDraft({ accountName: event.target.value })
                  }
                  placeholder="Name shown on receipt"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment-account-number">
                  Account number or handle
                </Label>
                <Input
                  id="payment-account-number"
                  value={draft.accountNumber}
                  aria-invalid={showErrors && !draft.accountNumber.trim()}
                  onChange={(event) =>
                    updateDraft({ accountNumber: event.target.value })
                  }
                  placeholder="0917..., bank account, or handle"
                />
              </div>
            </div>

            {showErrors &&
            (!draft.accountName.trim() || !draft.accountNumber.trim()) ? (
              <p className="text-xs text-destructive">
                Account name and account number are required.
              </p>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="payment-qr">Payment QR code</Label>
              <Input
                id="payment-qr"
                type="file"
                accept="image/*"
                onChange={(event) => void handleQrChange(event)}
              />
              {draft.qrCodeImageUrl ? (
                <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
                  <img
                    src={draft.qrCodeImageUrl}
                    alt="Payment QR code preview"
                    className="mx-auto aspect-square w-40 rounded-md border bg-white object-contain p-2"
                  />
                  <span className="text-center text-xs text-muted-foreground">
                    {draft.qrCodeFileName}
                  </span>
                </div>
              ) : null}
              {showErrors && !draft.qrCodeImageUrl ? (
                <p className="text-xs text-destructive">
                  QR code image is required.
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-instructions">Instructions</Label>
              <textarea
                id="payment-instructions"
                value={draft.instructions}
                onChange={(event) =>
                  updateDraft({ instructions: event.target.value })
                }
                placeholder="Optional note shown before customers upload payment proof."
                className="min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {editingMethodId ? (
                <Button type="button" variant="outline" onClick={resetDraft}>
                  Cancel
                </Button>
              ) : null}
              <Button type="button" onClick={handleSave}>
                <Save className="size-4" aria-hidden="true" />
                {editingMethodId ? "Save method" : "Add method"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">Reusable library</CardTitle>
            <CardDescription>
              Showing payment methods for {owner?.email ?? "this owner"} only.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {paymentMethods.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No payment methods yet.
              </div>
            ) : (
              paymentMethods.map((method) => {
                const qrVisible = showQrForMethodId === method.id
                const methodMode = resolvePaymentModeOption(method)

                return (
                  <div
                    key={method.id}
                    className="grid gap-3 rounded-lg border bg-background p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">
                            {method.displayName}
                          </p>
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            <PaymentModeMark
                              option={methodMode}
                              className="size-5 text-[9px]"
                            />
                            {methodMode.label}
                          </span>
                          {method.isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              <CheckCircle2
                                className="size-3"
                                aria-hidden="true"
                              />
                              Active
                            </span>
                          ) : (
                            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {method.accountName} / {method.accountNumber}
                        </p>
                      </div>
                      <PaymentModeMark option={methodMode} />
                    </div>

                    {qrVisible ? (
                      <img
                        src={method.qrCodeImageUrl}
                        alt={`${method.displayName} QR code`}
                        className="mx-auto aspect-square w-36 rounded-md border bg-white object-contain p-2"
                      />
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowQrForMethodId(qrVisible ? null : method.id)
                        }
                      >
                        {qrVisible ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <QrCode className="size-4" aria-hidden="true" />
                        )}
                        {qrVisible ? "Hide QR" : "View QR"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(method)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => togglePaymentMethodStatus(method.id)}
                      >
                        {method.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${method.displayName}`}
                        onClick={() => removePaymentMethod(method.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
