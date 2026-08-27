import { useRef, useState } from "react"
import { CalendarCheck, Eye, EyeOff, Mail, UserRound } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
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
import { getAuthErrorMessage, getAuthValidationErrors } from "@/lib/auth-api"
import { useAuth } from "@/lib/auth-context"
import {
  loginSchema,
  sanitizeEmail,
  sanitizeText,
  signupSchema,
} from "@/lib/validation"

type AuthMode = "login" | "signup"

function firstFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors = error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >
  const result: Record<string, string> = {}

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      result[field] = messages[0]!
    }
  }

  return result
}

type AuthCardProps = {
  mode: AuthMode
}

const authCopy = {
  login: {
    title: "Log in",
    description: "Manage your courts, bookings, and player schedule.",
    actionHref: "/signup",
    actionLabel: "Create account",
    submitLabel: "Log in",
    footer: "New to PickleBuddzy?",
    footerHref: "/signup",
    footerLink: "Sign Up",
  },
  signup: {
    title: "Create your account",
    description: "Set up your pickleball booking workspace in minutes.",
    actionHref: "/login",
    actionLabel: "Log in",
    submitLabel: "Create account",
    footer: "Already have an account?",
    footerHref: "/login",
    footerLink: "Log in",
  },
}

export function AuthCard({ mode }: AuthCardProps) {
  const copy = authCopy[mode]
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success"
    text: string
  } | null>(null)
  const isSubmittingRef = useRef(false)
  const passwordsMismatch =
    mode === "signup" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword

  function goToDestination() {
    const state = location.state as { from?: { pathname?: string } } | null
    navigate(state?.from?.pathname ?? "/booking", { replace: true })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmittingRef.current) {
      return
    }

    const sanitizedEmail = sanitizeEmail(email)

    if (mode === "signup") {
      const result = signupSchema.safeParse({
        name: sanitizeText(name),
        email: sanitizedEmail,
        password,
        confirmPassword,
      })

      if (!result.success) {
        const errors = firstFieldErrors(result.error)
        setFieldErrors(errors)
        setFormMessage({
          type: "error",
          text: Object.values(errors)[0] ?? "Some fields need attention.",
        })
        return
      }

      setFieldErrors({})
      setFormMessage(null)
      isSubmittingRef.current = true
      setIsSubmitting(true)
      try {
        await signup({
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
        })
        setFormMessage({
          type: "success",
          text: `Welcome, ${result.data.name}!`,
        })
      } catch (error) {
        const apiFieldErrors = getAuthValidationErrors(error)
        if (Object.keys(apiFieldErrors).length > 0) {
          setFieldErrors((current) => ({
            ...current,
            name: apiFieldErrors.full_name ?? current.name,
            email: apiFieldErrors.email ?? current.email,
            password: apiFieldErrors.password ?? current.password,
          }))
        }
        setFormMessage({
          type: "error",
          text: getAuthErrorMessage(
            error,
            "Unable to create your account right now."
          ),
        })
        return
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    } else {
      const result = loginSchema.safeParse({ email: sanitizedEmail, password })

      if (!result.success) {
        const errors = firstFieldErrors(result.error)
        setFieldErrors(errors)
        setFormMessage({
          type: "error",
          text: Object.values(errors)[0] ?? "Some fields need attention.",
        })
        return
      }

      setFieldErrors({})
      setFormMessage(null)
      isSubmittingRef.current = true
      setIsSubmitting(true)
      try {
        await login(result.data)
        setFormMessage({
          type: "success",
          text: `Signed in as ${result.data.email}`,
        })
      } catch (error) {
        setFormMessage({
          type: "error",
          text: getAuthErrorMessage(error, "Unable to sign in right now."),
        })
        return
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    }

    goToDestination()
  }

  return (
    <main className="flex min-h-svh bg-muted/40">
      <section
        className="relative hidden min-h-svh flex-1 overflow-hidden lg:flex"
        style={{
          backgroundImage: "url('/images/loginbgf.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-black/70 via-black/30 to-primary/30" />

        {/* Glow */}
        <div className="absolute top-24 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col justify-between p-10">
          {/* Logo */}
          <Link to="/" className="flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg">
              <CalendarCheck className="h-5 w-5 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-white">
                PickleBuddy
              </h2>
              <p className="text-xs text-white/70">Court Booking Platform</p>
            </div>
          </Link>

          {/* Center Text */}
          <div className="max-w-xl">
            <h1 className="mt-6 text-5xl leading-tight font-extrabold text-white">
              Book courts.
              <br />
              Play more.
              <br />
              Stress less.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              Manage reservations, organize matches, and connect with
              players—all from one modern platform built for pickleball
              communities.
            </p>
          </div>

          {/* Bottom Cards */}
          <div className="flex gap-4 text-white">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-white/70">Players Registered</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-white/70">Court Booking</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-white/70">Mobile Friendly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <Card className="w-full max-w-md rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <form id="auth-form" className="grid gap-5" onSubmit={handleSubmit}>
              {formMessage ? (
                <div
                  className={
                    formMessage.type === "error"
                      ? "rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                      : "rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary"
                  }
                >
                  {formMessage.text}
                </div>
              ) : null}
              {mode === "signup" ? (
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="name"
                      className="pl-8"
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value)
                        setFieldErrors((current) => ({ ...current, name: "" }))
                        setFormMessage(null)
                      }}
                      aria-invalid={Boolean(fieldErrors.name)}
                      required
                    />
                  </div>
                  {fieldErrors.name ? (
                    <p className="text-sm text-destructive">
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    className="pl-8"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setFieldErrors((current) => ({ ...current, email: "" }))
                      setFormMessage(null)
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" ? (
                    <Link
                      to="/forgot-password"
                      className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Forgot password?
                    </Link>
                  ) : null}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setFieldErrors((current) => ({ ...current, password: "" }))
                      setFormMessage(null)
                    }}
                    aria-invalid={Boolean(fieldErrors.password || passwordsMismatch)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {mode === "signup" && !fieldErrors.password ? (
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters with at least one letter and one number.
                  </p>
                ) : null}
                {fieldErrors.password ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              {mode === "signup" && (
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value)
                        setFieldErrors((current) => ({
                          ...current,
                          confirmPassword: "",
                        }))
                        setFormMessage(null)
                      }}
                      aria-invalid={Boolean(
                        fieldErrors.confirmPassword || passwordsMismatch
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword ? (
                    <p className="text-sm text-destructive">
                      {fieldErrors.confirmPassword}
                    </p>
                  ) : passwordsMismatch ? (
                    <p className="text-sm text-destructive">
                      Passwords do not match.
                    </p>
                  ) : confirmPassword.length > 0 ? (
                    <p className="text-sm text-primary">Passwords match.</p>
                  ) : null}
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <button
              type="submit"
              form="auth-form"
              disabled={isSubmitting}
              className={buttonVariants({ className: "w-full" })}
            >
              {isSubmitting
                ? mode === "signup"
                  ? "Creating account..."
                  : "Signing in..."
                : copy.submitLabel}
            </button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              disabled
              title="Google sign-in isn't available in this preview build yet"
            >
              Continue with Google
            </Button>
            <p className="text-sm text-muted-foreground">
              {copy.footer}{" "}
              <Link
                className="font-medium text-foreground underline-offset-4 hover:underline"
                to={copy.footerHref}
              >
                {copy.footerLink}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
