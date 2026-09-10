/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { persistStorageItem, readStorageItem } from "@/lib/auth-storage"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import type {
  GymPaymentSetup,
  PaymentProvider,
} from "@/shared/lib/gyms-context"

export type OwnerPaymentMethod = GymPaymentSetup & {
  id: string
  displayName: string
  isActive: boolean
}

export type OwnerPaymentMethodInput = Omit<OwnerPaymentMethod, "id">

type OwnerPaymentMethodsContextValue = {
  paymentMethods: OwnerPaymentMethod[]
  activePaymentMethods: OwnerPaymentMethod[]
  addPaymentMethod: (method: OwnerPaymentMethodInput) => void
  updatePaymentMethod: (
    methodId: string,
    update: Partial<OwnerPaymentMethodInput>
  ) => void
  removePaymentMethod: (methodId: string) => void
  togglePaymentMethodStatus: (methodId: string) => void
}

const OwnerPaymentMethodsContext = React.createContext<
  OwnerPaymentMethodsContextValue | undefined
>(undefined)

function storageKeyForOwner(ownerId: string) {
  return `pb-owner-payment-methods:${ownerId}`
}

function isPaymentProvider(value: unknown): value is PaymentProvider {
  return (
    value === "GCash" ||
    value === "Bank Transfer" ||
    value === "Maya" ||
    value === "Other"
  )
}

function isOwnerPaymentMethod(value: unknown): value is OwnerPaymentMethod {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as OwnerPaymentMethod).id === "string" &&
    isPaymentProvider((value as OwnerPaymentMethod).provider) &&
    typeof (value as OwnerPaymentMethod).displayName === "string" &&
    typeof (value as OwnerPaymentMethod).accountName === "string" &&
    typeof (value as OwnerPaymentMethod).accountNumber === "string" &&
    typeof (value as OwnerPaymentMethod).qrCodeImageUrl === "string" &&
    typeof (value as OwnerPaymentMethod).qrCodeFileName === "string" &&
    typeof (value as OwnerPaymentMethod).isActive === "boolean" &&
    ((value as OwnerPaymentMethod).instructions === undefined ||
      typeof (value as OwnerPaymentMethod).instructions === "string")
  )
}

function isOwnerPaymentMethodArray(
  value: unknown
): value is OwnerPaymentMethod[] {
  return Array.isArray(value) && value.every(isOwnerPaymentMethod)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function createMethodId(label: string) {
  const slug = slugify(label) || "payment-method"
  return `${slug}-${Date.now().toString(36)}`
}

function normalizePaymentMethod(
  method: OwnerPaymentMethodInput
): OwnerPaymentMethodInput {
  return {
    provider: method.provider,
    displayName: method.displayName.trim(),
    accountName: method.accountName.trim(),
    accountNumber: method.accountNumber.trim(),
    instructions: method.instructions?.trim() || undefined,
    qrCodeImageUrl: method.qrCodeImageUrl,
    qrCodeFileName: method.qrCodeFileName,
    isActive: method.isActive,
  }
}

export function mapOwnerPaymentMethodToGymPayment(
  method: OwnerPaymentMethod
): GymPaymentSetup {
  return {
    provider: method.provider,
    accountName: method.accountName,
    accountNumber: method.accountNumber,
    instructions: method.instructions,
    qrCodeImageUrl: method.qrCodeImageUrl,
    qrCodeFileName: method.qrCodeFileName,
  }
}

export function paymentMethodMatchesGymPayment(
  method: OwnerPaymentMethod,
  payment: GymPaymentSetup
) {
  return (
    method.provider === payment.provider &&
    method.accountName === payment.accountName &&
    method.accountNumber === payment.accountNumber
  )
}

export function OwnerPaymentMethodsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { owner } = useOwnerAuth()
  const [paymentMethods, setPaymentMethodsState] = React.useState<
    OwnerPaymentMethod[]
  >([])

  React.useEffect(() => {
    if (!owner) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Payment library follows the active owner session.
      setPaymentMethodsState([])
      return
    }

    const stored = readStorageItem(
      storageKeyForOwner(owner.id),
      isOwnerPaymentMethodArray
    )
    setPaymentMethodsState(stored ?? [])
  }, [owner])

  const persistForOwner = React.useCallback(
    (nextMethods: OwnerPaymentMethod[]) => {
      if (!owner) {
        return
      }

      persistStorageItem(storageKeyForOwner(owner.id), nextMethods)
    },
    [owner]
  )

  const addPaymentMethod = React.useCallback(
    (method: OwnerPaymentMethodInput) => {
      setPaymentMethodsState((current) => {
        const normalized = normalizePaymentMethod(method)
        const next = [
          {
            ...normalized,
            id: createMethodId(
              normalized.displayName || normalized.accountNumber
            ),
          },
          ...current,
        ]

        persistForOwner(next)
        return next
      })
    },
    [persistForOwner]
  )

  const updatePaymentMethod = React.useCallback(
    (methodId: string, update: Partial<OwnerPaymentMethodInput>) => {
      setPaymentMethodsState((current) => {
        const next = current.map((method) =>
          method.id === methodId
            ? {
                ...normalizePaymentMethod({ ...method, ...update }),
                id: method.id,
              }
            : method
        )

        persistForOwner(next)
        return next
      })
    },
    [persistForOwner]
  )

  const removePaymentMethod = React.useCallback(
    (methodId: string) => {
      setPaymentMethodsState((current) => {
        const next = current.filter((method) => method.id !== methodId)

        persistForOwner(next)
        return next
      })
    },
    [persistForOwner]
  )

  const togglePaymentMethodStatus = React.useCallback(
    (methodId: string) => {
      setPaymentMethodsState((current) => {
        const next = current.map((method) =>
          method.id === methodId
            ? { ...method, isActive: !method.isActive }
            : method
        )

        persistForOwner(next)
        return next
      })
    },
    [persistForOwner]
  )

  const activePaymentMethods = React.useMemo(
    () => paymentMethods.filter((method) => method.isActive),
    [paymentMethods]
  )

  const value = React.useMemo(
    () => ({
      paymentMethods,
      activePaymentMethods,
      addPaymentMethod,
      updatePaymentMethod,
      removePaymentMethod,
      togglePaymentMethodStatus,
    }),
    [
      activePaymentMethods,
      addPaymentMethod,
      paymentMethods,
      removePaymentMethod,
      togglePaymentMethodStatus,
      updatePaymentMethod,
    ]
  )

  return (
    <OwnerPaymentMethodsContext.Provider value={value}>
      {children}
    </OwnerPaymentMethodsContext.Provider>
  )
}

export function useOwnerPaymentMethods() {
  const context = React.useContext(OwnerPaymentMethodsContext)

  if (context === undefined) {
    throw new Error(
      "useOwnerPaymentMethods must be used within an OwnerPaymentMethodsProvider"
    )
  }

  return context
}
