import { AuthApiError } from "@/lib/auth-api"
import type { BookingRental } from "@/shared/lib/gyms-context"
import type { PaymentReceipt } from "@/shared/lib/payment-receipt"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001/api"

export type CreatePrivateBookingInput = {
  token: string
  venuePublicId: string
  courtPublicId: string
  bookingDate: string
  slotLabels: string[]
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
      booking_type: "private",
      booking_date: input.bookingDate,
      slot_labels: input.slotLabels,
      participant_count: 1,
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
  action: "approve" | "complete"
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
