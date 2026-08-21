import { Navigate } from "react-router-dom"

export function OpenPlayPage() {
  return <Navigate to="/booking?mode=open-play" replace />
}
