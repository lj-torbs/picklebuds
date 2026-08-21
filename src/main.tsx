import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { AdminAuthProvider } from "@/admin/lib/admin-auth-context"
import { AdminOwnersProvider } from "@/admin/lib/admin-owners-context"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { BookingsProvider } from "@/lib/bookings-context"
import { OwnerAuthProvider } from "@/owner/lib/owner-auth-context"
import { GymsProvider } from "@/shared/lib/gyms-context"
import { TransactionsProvider } from "@/shared/lib/transactions-context"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookingsProvider>
          <TransactionsProvider>
            <GymsProvider>
              <AdminAuthProvider>
                <AdminOwnersProvider>
                  <OwnerAuthProvider>
                    <ThemeProvider>
                      <ToastProvider>
                        <App />
                        <Toaster />
                      </ToastProvider>
                    </ThemeProvider>
                  </OwnerAuthProvider>
                </AdminOwnersProvider>
              </AdminAuthProvider>
            </GymsProvider>
          </TransactionsProvider>
        </BookingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
