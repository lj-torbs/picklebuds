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
