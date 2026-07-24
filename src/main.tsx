import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ToastProvider } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { BookingsProvider } from "@/lib/bookings-context"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookingsProvider>
          <ThemeProvider>
            <ToastProvider>
              <App />
              <Toaster />
            </ToastProvider>
          </ThemeProvider>
        </BookingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
