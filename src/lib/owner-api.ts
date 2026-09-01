import { AuthApiError } from "@/lib/auth-api"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001/api"

function hasDetailPayload(payload: unknown): payload is { detail?: string } {
  return typeof payload === "object" && payload !== null && "detail" in payload
}

export type OwnerDashboardApiStats = {
  total_revenue: number
  pending_count: number
  completed_count: number
  cancelled_count: number
  venue_count: number
  court_count: number
}

export type OwnerBookingApiRental = {
  rental_item_public_id: string
  item_name: string
  category: "paddle" | "ball" | "shoes" | "net" | "other"
  price_per_session: number
  quantity: number
}

export type OwnerTransactionApiItem = {
  public_id: string
  venue_public_id: string
  venue_name: string
  court_public_id: string | null
  court_name: string | null
  booking_type: "private" | "open_play" | "whole_gym"
  booking_date: string
  slot_labels: string[]
  participant_count: number
  amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  payment_status: "unpaid" | "paid" | "refunded"
  payment_review_status: "pending" | "approved" | "rejected"
  payment_method_label: string | null
  reference_number: string | null
  sender_account_name: string | null
  receipt_file_name: string | null
  receipt_image_url: string | null
  receipt_uploaded_at: string | null
  customer_name: string
  customer_email: string
  created_at: string
  rentals: OwnerBookingApiRental[]
}

export type OwnerDashboardApiResponse = {
  stats: OwnerDashboardApiStats
  recent_transactions: OwnerTransactionApiItem[]
}

export type OwnerVenueApiResponse = {
  public_id: string
  owner_public_id: string
  name: string
  address: string
  phone: string | null
  status: "active" | "inactive"
  image_url: string | null
  payment_methods: Array<{
    id: number
    provider: "GCash" | "Bank Transfer" | "Maya" | "Other"
    display_name: string
    account_name: string
    account_number: string
    instructions: string | null
    qr_code_image_url: string
    qr_code_file_name: string
    is_active: boolean
  }>
  whole_gym_booking: {
    enabled: boolean
    price_per_hour: number | null
    available_slots: string[]
    notes: string | null
  } | null
  rental_items: Array<{
    public_id: string
    name: string
    category: "paddle" | "ball" | "shoes" | "net" | "other"
    price_per_session: number
    quantity_available: number
    status: "available" | "unavailable"
    description: string | null
  }>
  courts: Array<{
    public_id: string
    name: string
    surface: string
    capacity_label: string
    price_per_hour: number
    status: "available" | "maintenance"
    booking_mode: "private" | "open_play"
    open_play_capacity: number | null
    available_slots: string[]
    image_url: string | null
  }>
}

async function parseApiResponse<T>(response: Response, fallback: string) {
  let payload: T | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (hasDetailPayload(payload) && payload.detail) || fallback,
      response.status,
      undefined,
      hasDetailPayload(payload) ? payload.detail : undefined
    )
  }

  return payload as T
}

export async function getOwnerDashboardWithApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/owners/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  return parseApiResponse<OwnerDashboardApiResponse>(
    response,
    "Unable to load owner dashboard right now."
  )
}

export async function getOwnerVenuesWithApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/owners/venues`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const payload = await parseApiResponse<{ items: OwnerVenueApiResponse[] }>(
    response,
    "Unable to load owner venues right now."
  )

  return payload.items
}

export async function getOwnerTransactionsWithApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/owners/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const payload = await parseApiResponse<{ items: OwnerTransactionApiItem[] }>(
    response,
    "Unable to load owner transactions right now."
  )

  return payload.items
}

export type OwnerVenueUpsertInput = {
  name: string
  address: string
  phone?: string
  status: "active" | "inactive"
  imageUrl?: string
  paymentOptions: Array<{
    provider: "GCash" | "Bank Transfer" | "Maya" | "Other"
    accountName: string
    accountNumber: string
    instructions?: string
    qrCodeImageUrl: string
    qrCodeFileName: string
  }>
  wholeGymBooking?: {
    enabled: boolean
    pricePerHour: number
    availableSlots: string[]
    notes?: string
  }
  rentalItems: Array<{
    id?: string
    name: string
    category: "paddle" | "ball" | "shoes" | "net" | "other"
    pricePerSession: number
    quantityAvailable: number
    status: "available" | "unavailable"
    description?: string
  }>
}

export type OwnerCourtUpsertInput = {
  name: string
  surface: string
  capacity: string
  pricePerHour: number
  status: "available" | "maintenance"
  bookingMode: "private" | "open-play"
  openPlayCapacity?: number
  availableSlots: string[]
  imageUrl?: string
}

function mapVenuePayload(input: OwnerVenueUpsertInput) {
  return {
    name: input.name,
    address: input.address,
    phone: input.phone || null,
    status: input.status,
    image_url: input.imageUrl || null,
    payment_methods: input.paymentOptions.map((option) => ({
      provider: option.provider,
      account_name: option.accountName,
      account_number: option.accountNumber,
      instructions: option.instructions || null,
      qr_code_image_url: option.qrCodeImageUrl,
      qr_code_file_name: option.qrCodeFileName,
      is_active: true,
    })),
    whole_gym_booking: input.wholeGymBooking
      ? {
          enabled: input.wholeGymBooking.enabled,
          price_per_hour: input.wholeGymBooking.pricePerHour,
          available_slots: input.wholeGymBooking.availableSlots,
          notes: input.wholeGymBooking.notes || null,
        }
      : null,
    rental_items: input.rentalItems.map((item) => ({
      public_id: item.id || null,
      name: item.name,
      category: item.category,
      price_per_session: item.pricePerSession,
      quantity_available: item.quantityAvailable,
      status: item.status,
      description: item.description || null,
    })),
  }
}

function mapCourtPayload(input: OwnerCourtUpsertInput) {
  return {
    name: input.name,
    surface: input.surface,
    capacity_label: input.capacity,
    price_per_hour: input.pricePerHour,
    status: input.status,
    booking_mode: input.bookingMode === "open-play" ? "open_play" : "private",
    open_play_capacity:
      input.bookingMode === "open-play" ? input.openPlayCapacity ?? null : null,
    available_slots: input.availableSlots,
    image_url: input.imageUrl || null,
  }
}

export async function createOwnerVenueWithApi(
  token: string,
  input: OwnerVenueUpsertInput
) {
  const response = await fetch(`${API_BASE_URL}/owners/venues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapVenuePayload(input)),
  })

  return parseApiResponse<OwnerVenueApiResponse>(
    response,
    "Unable to create venue right now."
  )
}

export async function updateOwnerVenueWithApi(
  token: string,
  venuePublicId: string,
  input: OwnerVenueUpsertInput
) {
  const response = await fetch(`${API_BASE_URL}/owners/venues/${venuePublicId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapVenuePayload(input)),
  })

  return parseApiResponse<OwnerVenueApiResponse>(
    response,
    "Unable to update venue right now."
  )
}

export async function setOwnerVenueStatusWithApi(
  token: string,
  venuePublicId: string,
  status: "active" | "inactive"
) {
  const response = await fetch(
    `${API_BASE_URL}/owners/venues/${venuePublicId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  )

  return parseApiResponse<OwnerVenueApiResponse>(
    response,
    "Unable to update venue status right now."
  )
}

export async function createOwnerCourtWithApi(
  token: string,
  venuePublicId: string,
  input: OwnerCourtUpsertInput
) {
  const response = await fetch(
    `${API_BASE_URL}/owners/venues/${venuePublicId}/courts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapCourtPayload(input)),
    }
  )

  return parseApiResponse<OwnerVenueApiResponse>(
    response,
    "Unable to create court right now."
  )
}

export async function updateOwnerCourtWithApi(
  token: string,
  venuePublicId: string,
  courtPublicId: string,
  input: OwnerCourtUpsertInput
) {
  const response = await fetch(
    `${API_BASE_URL}/owners/venues/${venuePublicId}/courts/${courtPublicId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapCourtPayload(input)),
    }
  )

  return parseApiResponse<OwnerVenueApiResponse>(
    response,
    "Unable to update court right now."
  )
}

export async function setOwnerCourtStatusWithApi(
  token: string,
  venuePublicId: string,
  courtPublicId: string,
  status: "available" | "maintenance"
) {
  const response = await fetch(
    `${API_BASE_URL}/owners/venues/${venuePublicId}/courts/${courtPublicId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  )

  return parseApiResponse<OwnerVenueApiResponse>(
    response,
    "Unable to update court status right now."
  )
}

export async function deleteOwnerCourtWithApi(
  token: string,
  venuePublicId: string,
  courtPublicId: string
) {
  const response = await fetch(
    `${API_BASE_URL}/owners/venues/${venuePublicId}/courts/${courtPublicId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return parseApiResponse<OwnerVenueApiResponse>(
    response,
    "Unable to delete court right now."
  )
}
