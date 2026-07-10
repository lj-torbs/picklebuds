import type { ComponentType } from "react"

import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { SignupPage } from "@/pages/signup-page"

const routes: Record<string, ComponentType> = {
  "/": LandingPage,
  "/login": LoginPage,
  "/signup": SignupPage,
}

export function App() {
  const Page = routes[window.location.pathname] ?? LandingPage

  return <Page />
}

export default App
