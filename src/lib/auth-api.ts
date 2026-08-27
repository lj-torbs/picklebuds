export type AuthRole = "player" | "owner" | "admin"

export type AuthApiUser = {
  id: number
  public_id: string
  full_name: string
  email: string
  role: AuthRole
  joined_at?: string | null
}

export type AuthLoginResponse = {
  access_token: string
  token_type: string
  role: AuthRole
  user: AuthApiUser
}

export type AuthSignupResponse = AuthLoginResponse

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8001/api"

export class AuthApiError extends Error {
  status: number
  retryAfterSeconds?: number
  detail?: unknown

  constructor(
    message: string,
    status: number,
    retryAfterSeconds?: number,
    detail?: unknown
  ) {
    super(message)
    this.name = "AuthApiError"
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
    this.detail = detail
  }
}

export async function loginWithApi(
  email: string,
  password: string,
  role: AuthRole
) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  })

  let payload: AuthLoginResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const retryAfterHeader = response.headers.get("Retry-After")
    const retryAfterSeconds = retryAfterHeader
      ? Number.parseInt(retryAfterHeader, 10)
      : undefined
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to sign in right now.",
      response.status,
      Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return payload as AuthLoginResponse
}

export async function signupWithApi(
  fullName: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ full_name: fullName, email, password }),
  })

  let payload: AuthSignupResponse | { detail?: string } | null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new AuthApiError(
      (payload && "detail" in payload && payload.detail) ||
        "Unable to create your account right now.",
      response.status,
      undefined,
      payload && "detail" in payload ? payload.detail : undefined
    )
  }

  return payload as AuthSignupResponse
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof AuthApiError)) {
    return fallback
  }

  if (error.status === 429) {
    return error.retryAfterSeconds
      ? `Too many attempts. Try again in ${error.retryAfterSeconds} seconds.`
      : "Too many attempts. Try again in a few minutes."
  }

  return error.message || fallback
}

export function getAuthValidationErrors(error: unknown) {
  if (!(error instanceof AuthApiError) || error.status !== 422) {
    return {}
  }

  if (!Array.isArray(error.detail)) {
    return {}
  }

  const fieldErrors: Record<string, string> = {}

  for (const issue of error.detail) {
    if (
      typeof issue !== "object" ||
      issue === null ||
      !("loc" in issue) ||
      !Array.isArray(issue.loc) ||
      !("msg" in issue) ||
      typeof issue.msg !== "string"
    ) {
      continue
    }

    const field = issue.loc[issue.loc.length - 1]
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.msg
    }
  }

  return fieldErrors
}
