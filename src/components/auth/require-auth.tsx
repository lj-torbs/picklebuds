import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth-context"

export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const redirect = `${location.pathname}${location.search}${location.hash}`
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
