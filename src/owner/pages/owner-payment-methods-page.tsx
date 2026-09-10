import { useMemo, useState, type ChangeEvent } from "react"
import {
  CheckCircle2,
  CreditCard,
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

const paymentProviderOptions: PaymentProvider[] = [
  "GCash",
  "Bank Transfer",
  "Maya",
  "Other",
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

  const editingMethod = useMemo(
    () =>
      editingMethodId
        ? (paymentMethods.find((method) => method.id === editingMethodId) ??
          null)
        : null,
    [editingMethodId, paymentMethods]
  )

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
  }

  function handleEdit(method: OwnerPaymentMethod) {
    setEditingMethodId(method.id)
    setShowErrors(false)
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
              <select
                id="payment-provider"
                value={draft.provider}
                onChange={(event) =>
                  updateDraft({
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
              These are scoped to the signed-in owner account.
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
                          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            {method.provider}
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
                      <CreditCard
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
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
