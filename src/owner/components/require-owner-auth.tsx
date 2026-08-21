import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAdminOwners } from "@/admin/lib/admin-owners-context"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"

export function RequireOwnerAuth() {
  const { owner } = useOwnerAuth()
  const { owners } = useAdminOwners()
  const location = useLocation()

  if (!owner) {
    return <Navigate to="/owner/login" replace state={{ from: location }} />
  }

  const currentOwner = owners.find((record) => record.id === owner.id)
  if (currentOwner?.status === "suspended") {
    return (
      <Navigate
        to="/owner/login"
        replace
        state={{
          from: location,
          reason:
            currentOwner.suspensionReason === "system_payment_due"
              ? "payment_due"
              : "suspended",
        }}
      />
    )
  }

  return <Outlet />
}
