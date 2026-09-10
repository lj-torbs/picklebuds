import { AuthApiError } from "@/lib/auth-api"
import type { BookingRental } from "@/shared/lib/gyms-context"
import type { PaymentReceipt } from "@/shared/lib/payment-receipt"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001/api"

export type CreatePrivateBookingInput = {
  token: string
  venuePublicId: string
  courtPublicId: string | null
  bookingType: "private" | "open_play" | "whole_gym"
  bookingDate: string
  slotLabels: string[]
  participantCount: number
  totalAmount: number
  rentals: BookingRental[]
  paymentReceipt: PaymentReceipt
  paymentProvider: string
  paymentAccountNumber: string
}

export type BookingApiResponse = {
  public_id: string
  venue_public_id: string
  court_public_id: string | null
  booking_type: "private" | "open_play" | "whole_gym"
  booking_date: string
  slot_labels: string[]
  participant_count: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  payment_status: "unpaid" | "paid" | "refunded"
  total_amount: number
}

export type BookingApiRentalResponse = {
  rental_item_public_id: string
  item_name: string
  category: "paddle" | "ball" | "shoes" | "net" | "other"
  price_per_session: number
  quantity: number
}

export type MyBookingApiItem = BookingApiResponse & {
  venue_name: string
  venue_address: string
  court_name: string | null
  booked_by_name: string
  booked_by_email: string
  rentals: BookingApiRentalResponse[]
}

export type MyBookingsApiResponse = {
  items: MyBookingApiItem[]
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
  rentals: BookingApiRentalResponse[]
}

export type OwnerTransactionsApiResponse = {
  items: OwnerTransactionApiItem[]
}

export type BookingActionApiResponse = {
  public_id: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  payment_status: "unpaid" | "paid" | "refunded"
  payment_review_status: "pending" | "approved" | "rejected" | null
}

export type VenuePaymentMethodApiResponse = {
  id: number
  provider: "GCash" | "Bank Transfer" | "Maya" | "Other"
  display_name: string
  account_name: string
  account_number: string
  instructions: string | null
  qr_code_image_url: string
  qr_code_file_name: string
  is_active: boolean
}

export type VenueRentalItemApiResponse = {
  public_id: string
  name: string
  category: "paddle" | "ball" | "shoes" | "net" | "other"
  price_per_session: number
  quantity_available: number
  status: "available" | "unavailable"
  description: string | null
}

export type VenueCourtApiResponse = {
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
}

export type VenueWholeGymBookingApiResponse = {
  enabled: boolean
  price_per_hour: number | null
  available_slots: string[]
  notes: string | null
}

export type VenueDetailApiResponse = {
  public_id: string
  owner_public_id: string
  name: string
  address: string
  phone: string | null
  status: "active" | "inactive"
  image_url: string | null
  payment_methods: VenuePaymentMethodApiResponse[]
  whole_gym_booking: VenueWholeGymBookingApiResponse | null
  rental_items: VenueRentalItemApiResponse[]
  courts: VenueCourtApiResponse[]
}

export type VenueListItemApiResponse = {
  public_id: string
  name: string
  address: string
  phone: string | null
  status: "active" | "inactive"
  image_url: string | null
  court_count: number
  has_open_play: boolean
  whole_gym_enabled: boolean
}

export type VenueListApiResponse = {
  items: VenueListItemApiResponse[]
}

export type VenueAvailabilityItemApiResponse = {
  date: string
  slot_label: string
  state: "available" | "booked" | "closed"
  booking_public_id: string | null
  booking_type: "private" | "open_play" | "whole_gym" | null
  seats_taken: number | null
  seats_capacity: number | null
}

export type VenueCourtAvailabilityApiResponse = {
  court_public_id: string
  court_name: string
  booking_mode: "private" | "open_play"
  items: VenueAvailabilityItemApiResponse[]
}

export type VenueWholeGymAvailabilityApiResponse = {
  items: VenueAvailabilityItemApiResponse[]
}

export type VenueAvailabilityApiResponse = {
  venue_public_id: string
  date_from: string
  days: number
  courts: VenueCourtAvailabilityApiResponse[]
  whole_gym: VenueWholeGymAvailabilityApiResponse | null
}

export async function createPrivateBookingWithApi(
  input: CreatePrivateBookingInput
) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({
      venue_public_id: input.venuePublicId,
      court_public_id: input.courtPublicId,
      booking_type: input.bookingType,
      booking_date: input.bookingDate,
      slot_labels: input.slotLabels,
      participant_count: input.participantCount,
      total_amount: input.totalAmount,
      rentals: input.rentals.map((rental) => ({
        rental_item_public_id: rental.itemId,
        quantity: rental.quantity,
      })),
      payment: {
        provider: input.paymentProvider,
        account_number: input.paymentAccountNumber,
        reference_number: input.paymentReceipt.referenceNumber,
        sender_account_name: input.paymentReceipt.accountName,
        receipt_file_name: input.paymentReceipt.fileName,
        receipt_image_url: input.paymentReceipt.imageUrl,
      },
    }),
  })

  let payload: BookingApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to submit your booking right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return payload as BookingApiResponse
}

export async function getMyBookingsWithApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  let payload: MyBookingsApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to load your bookings right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return (payload as MyBookingsApiResponse).items
}

export async function getOwnerTransactionsWithApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/owner/reviews`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  let payload: OwnerTransactionsApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to load owner transactions right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return (payload as OwnerTransactionsApiResponse).items
}

async function postOwnerBookingAction(
  token: string,
  bookingPublicId: string,
  action: "approve" | "reject" | "complete" | "cancel" | "refund"
) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${bookingPublicId}/${action}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  let payload: BookingActionApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to update this booking right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return payload as BookingActionApiResponse
}

export function approveBookingPaymentWithApi(
  token: string,
  bookingPublicId: string
) {
  return postOwnerBookingAction(token, bookingPublicId, "approve")
}

export function completeOwnerBookingWithApi(
  token: string,
  bookingPublicId: string
) {
  return postOwnerBookingAction(token, bookingPublicId, "complete")
}

export function rejectBookingPaymentWithApi(
  token: string,
  bookingPublicId: string
) {
  return postOwnerBookingAction(token, bookingPublicId, "reject")
}

export function cancelOwnerBookingWithApi(
  token: string,
  bookingPublicId: string
) {
  return postOwnerBookingAction(token, bookingPublicId, "cancel")
}

export async function cancelPlayerBookingWithApi(
  token: string,
  bookingPublicId: string
) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${bookingPublicId}/player-cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  let payload: BookingActionApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to cancel this booking right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return payload as BookingActionApiResponse
}

export function refundOwnerBookingWithApi(
  token: string,
  bookingPublicId: string
) {
  return postOwnerBookingAction(token, bookingPublicId, "refund")
}

export async function getVenuesWithApi() {
  const response = await fetch(`${API_BASE_URL}/venues`)

  let payload: VenueListApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to load venues right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return (payload as VenueListApiResponse).items
}

export async function getVenueDetailWithApi(venuePublicId: string) {
  const response = await fetch(`${API_BASE_URL}/venues/${venuePublicId}`)

  let payload: VenueDetailApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to load venue details right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return payload as VenueDetailApiResponse
}

export async function getVenueAvailabilityWithApi(
  venuePublicId: string,
  dateFrom: string,
  days: number
) {
  const searchParams = new URLSearchParams({
    date_from: dateFrom,
    days: String(days),
  })
  const response = await fetch(
    `${API_BASE_URL}/venues/${venuePublicId}/availability?${searchParams.toString()}`
  )

  let payload: VenueAvailabilityApiResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to load venue availability right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return payload as VenueAvailabilityApiResponse
}
