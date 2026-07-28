import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAdminAuth } from "@/admin/lib/admin-auth-context"

export function RequireAdminAuth() {
  const { admin } = useAdminAuth()
  const location = useLocation()

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
