const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001/api"

export type AdminApiOwnerSummary = {
  id: string
  name: string
  email: string
  phone?: string | null
  joined_at?: string | null
  status: "active" | "suspended" | "inactive"
  system_payment_status: "paid" | "unpaid"
  suspension_reason?: "system_payment_due" | "manual_review" | null
  total_gyms: number
  total_courts: number
  gross_revenue: number
  system_share: number
  owner_total_profit: number
}

export type AdminApiOwnerTransaction = {
  id: string
  booking_id: string
  customer_name: string
  gym_name: string
  court_name: string
  booking_type: "private" | "open_play" | "whole_gym"
  booking_date: string
  amount: number
  payment_status: "paid" | "unpaid" | "refunded"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
}

export type AdminApiOwnerDetail = {
  owner: AdminApiOwnerSummary
  transactions: AdminApiOwnerTransaction[]
}

export class AdminApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "AdminApiError"
    this.status = status
  }
}

function buildHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  let payload: T | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AdminApiError(
      (payload && typeof payload === "object" && payload !== null && "detail" in payload
        ? payload.detail
        : null) || fallback,
      response.status
    )
  }

  return payload as T
}

export async function getAdminOwners(input: {
  token: string
  dateFrom?: string
  dateTo?: string
}) {
  const params = new URLSearchParams()
  if (input.dateFrom) {
    params.set("date_from", input.dateFrom)
  }
  if (input.dateTo) {
    params.set("date_to", input.dateTo)
  }

  const query = params.toString()
  const response = await fetch(
    `${API_BASE_URL}/admin/owners${query ? `?${query}` : ""}`,
    {
      headers: buildHeaders(input.token),
    }
  )

  return parseResponse<{ items: AdminApiOwnerSummary[] }>(
    response,
    "Unable to load owners."
  )
}

export async function getAdminOwnerDetail(input: {
  token: string
  ownerId: string
  dateFrom?: string
  dateTo?: string
}) {
  const params = new URLSearchParams()
  if (input.dateFrom) {
    params.set("date_from", input.dateFrom)
  }
  if (input.dateTo) {
    params.set("date_to", input.dateTo)
  }

  const query = params.toString()
  const response = await fetch(
    `${API_BASE_URL}/admin/owners/${input.ownerId}${query ? `?${query}` : ""}`,
    {
      headers: buildHeaders(input.token),
    }
  )

  return parseResponse<AdminApiOwnerDetail>(
    response,
    "Unable to load owner details."
  )
}

export async function updateAdminOwnerPaymentStatus(input: {
  token: string
  ownerId: string
  status: "paid" | "unpaid"
}) {
  const response = await fetch(
    `${API_BASE_URL}/admin/owners/${input.ownerId}/payment-status`,
    {
      method: "POST",
      headers: buildHeaders(input.token),
      body: JSON.stringify({ status: input.status }),
    }
  )

  return parseResponse<{
    owner_public_id: string
    status: "active" | "suspended" | "inactive"
    system_payment_status: "paid" | "unpaid"
    suspension_reason?: "system_payment_due" | "manual_review" | null
  }>(response, "Unable to update owner payment status.")
}

export async function updateAdminOwnerStatus(input: {
  token: string
  ownerId: string
  status: "active" | "suspended"
  reason?: "system_payment_due" | "manual_review"
}) {
  const response = await fetch(
    `${API_BASE_URL}/admin/owners/${input.ownerId}/status`,
    {
      method: "POST",
      headers: buildHeaders(input.token),
      body: JSON.stringify({ status: input.status, reason: input.reason }),
    }
  )

  return parseResponse<{
    owner_public_id: string
    status: "active" | "suspended" | "inactive"
    system_payment_status: "paid" | "unpaid"
    suspension_reason?: "system_payment_due" | "manual_review" | null
  }>(response, "Unable to update owner access.")
}

export async function lockAdminOwner(input: { token: string; ownerId: string }) {
  const response = await fetch(`${API_BASE_URL}/admin/owners/${input.ownerId}/lock`, {
    method: "POST",
    headers: buildHeaders(input.token),
  })

  return parseResponse<{
    owner_public_id: string
    status: "active" | "suspended" | "inactive"
    system_payment_status: "paid" | "unpaid"
    suspension_reason?: "system_payment_due" | "manual_review" | null
  }>(response, "Unable to lock owner access.")
}

export async function unlockAdminOwner(input: { token: string; ownerId: string }) {
  const response = await fetch(`${API_BASE_URL}/admin/owners/${input.ownerId}/unlock`, {
    method: "POST",
    headers: buildHeaders(input.token),
  })

  return parseResponse<{
    owner_public_id: string
    status: "active" | "suspended" | "inactive"
    system_payment_status: "paid" | "unpaid"
    suspension_reason?: "system_payment_due" | "manual_review" | null
  }>(response, "Unable to unlock owner access.")
}
