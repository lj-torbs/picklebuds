import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useOwnerAuth } from "@/owner/lib/owner-auth-context"

export function RequireOwnerAuth() {
  const { owner } = useOwnerAuth()
  const location = useLocation()

  if (!owner) {
    return <Navigate to="/owner/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
