import { Navigate, Route, Routes } from "react-router-dom"

import { RequireAuth } from "@/components/auth/require-auth"
import { BookingPage } from "@/pages/booking-page"
import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { MyBookingsPage } from "@/pages/my-bookings-page"
import { NotificationsPage } from "@/pages/notifications-page"
import { ProfilePage } from "@/pages/profile-page"
import { SignupPage } from "@/pages/signup-page"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
