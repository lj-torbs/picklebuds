import type { ComponentType } from "react"

import { BookingPage } from "@/pages/booking-page"
import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { MyBookingsPage } from "@/pages/my-bookings-page"
import { NotificationsPage } from "@/pages/notifications-page"
import { ProfilePage } from "@/pages/profile-page"
import { SignupPage } from "@/pages/signup-page"

const routes: Record<string, ComponentType> = {
  "/": LandingPage,
  "/booking": BookingPage,
  "/login": LoginPage,
  "/my-bookings": MyBookingsPage,
  "/notifications": NotificationsPage,
  "/profile": ProfilePage,
  "/signup": SignupPage,
}

export function App() {
  const Page = routes[window.location.pathname] ?? LandingPage

  return <Page />
}

export default App
