import { AuthApiError } from "@/lib/auth-api"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001/api"

function hasDetailPayload(payload: unknown): payload is { detail?: string } {
  return typeof payload === "object" && payload !== null && "detail" in payload
}

export type NotificationApiItem = {
  id: number
  recipient_type: "player" | "owner"
  title: string
  message: string
  action_url: string | null
  is_read: boolean
  created_at: string
}

export type OpenPlayAnnouncementResponse = {
  notified_count: number
  message: string
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

export async function getNotificationsWithApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await parseApiResponse<{ items: NotificationApiItem[] }>(
    response,
    "Unable to load notifications right now."
  )

  return payload.items
}

export async function markNotificationReadWithApi(
  token: string,
  notificationId: number
) {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return parseApiResponse<NotificationApiItem>(
    response,
    "Unable to update this notification right now."
  )
}

export async function announceOpenPlayWithApi(
  token: string,
  input: {
    venuePublicId: string
    courtPublicId: string
    bookingDate: string
    slotLabel: string
  }
) {
  const response = await fetch(`${API_BASE_URL}/notifications/open-play/announce`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      venue_public_id: input.venuePublicId,
      court_public_id: input.courtPublicId,
      booking_date: input.bookingDate,
      slot_label: input.slotLabel,
    }),
  })

  return parseApiResponse<OpenPlayAnnouncementResponse>(
    response,
    "Unable to announce this Open Play session right now."
  )
}
