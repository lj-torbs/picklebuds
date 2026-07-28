import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Building2, CalendarCheck, Lock, Mail } from "lucide-react"

import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { sanitizeEmail } from "@/lib/validation"

export function OwnerLoginPage() {
  const { login } = useOwnerAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sanitizedEmail = sanitizeEmail(email)
    if (!sanitizedEmail || !password) {
      toast.add({
        title: "Check your details",
        description: "Email and password are required.",
        type: "error",
      })
      return
    }

    login({ email: sanitizedEmail, password })
    toast.add({
      title: "Welcome back",
      description: `Signed in as ${sanitizedEmail}`,
      type: "success",
    })

    const state = location.state as { from?: { pathname?: string } } | null
    navigate(state?.from?.pathname ?? "/owner/dashboard", { replace: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-sidebar px-4 py-10">
      <Card className="w-full max-w-sm rounded-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Owner sign in</CardTitle>
          <CardDescription>
            Manage your venues, courts, and bookings.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="owner-login-form"
            className="grid gap-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-2">
              <Label htmlFor="owner-email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="owner-email"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  className="pl-8"
                  placeholder="you@yourgym.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="owner-password">Password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="owner-password"
                  type="password"
                  className="pl-8"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" form="owner-login-form" className="w-full">
            Log in
          </Button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <CalendarCheck className="size-3.5" aria-hidden="true" />
            Back to player site
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
