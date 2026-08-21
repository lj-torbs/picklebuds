import { Navigate, Route, Routes } from "react-router-dom"

import { RequireAdminAuth } from "@/admin/components/require-admin-auth"
import { AdminShell } from "@/admin/components/layout/admin-shell"
import { AdminDashboardPage } from "@/admin/pages/admin-dashboard-page"
import { AdminGymsPage } from "@/admin/pages/admin-gyms-page"
import { AdminLoginPage } from "@/admin/pages/admin-login-page"
import { AdminOwnersPage } from "@/admin/pages/admin-owners-page"
import { AdminTransactionsPage } from "@/admin/pages/admin-transactions-page"
import { RequireAuth } from "@/components/auth/require-auth"
import { OwnerShell } from "@/owner/components/layout/owner-shell"
import { RequireOwnerAuth } from "@/owner/components/require-owner-auth"
import { OwnerDashboardPage } from "@/owner/pages/owner-dashboard-page"
import { OwnerGymsPage } from "@/owner/pages/owner-gyms-page"
import { OwnerLoginPage } from "@/owner/pages/owner-login-page"
import { OwnerTransactionsPage } from "@/owner/pages/owner-transactions-page"
import { BookingPage } from "@/pages/booking-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { GymDetailPage } from "@/pages/gym-detail-page"
import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { MyBookingsPage } from "@/pages/my-bookings-page"
import { NotificationsPage } from "@/pages/notifications-page"
import { OpenPlayPage } from "@/pages/open-play-page"
import { PasaloPage } from "@/pages/pasalo-page"
import { ProfilePage } from "@/pages/profile-page"
import { SignupPage } from "@/pages/signup-page"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/:gymId" element={<GymDetailPage />} />
        <Route path="/open-play" element={<OpenPlayPage />} />
        <Route path="/pasalo" element={<PasaloPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<RequireAdminAuth />}>
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="gyms" element={<AdminGymsPage />} />
          <Route path="owners" element={<AdminOwnersPage />} />
          <Route path="users" element={<Navigate to="/admin/owners" replace />} />
        </Route>
      </Route>
      <Route path="/owner/login" element={<OwnerLoginPage />} />
      <Route element={<RequireOwnerAuth />}>
        <Route path="/owner" element={<OwnerShell />}>
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboardPage />} />
          <Route path="gyms" element={<OwnerGymsPage />} />
          <Route path="transactions" element={<OwnerTransactionsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
