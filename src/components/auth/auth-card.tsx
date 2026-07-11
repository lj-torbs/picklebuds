import { CalendarCheck, Mail, UserRound } from "lucide-react"

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

type AuthMode = "login" | "signup"

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
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col justify-between p-10">

          {/* Logo */}
          <a
            href="/"
            className="flex w-fit items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg">
              <CalendarCheck className="h-5 w-5 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-white">
                PickleBuddy
              </h2>
              <p className="text-xs text-white/70">
                Court Booking Platform
              </p>
            </div>
          </a>

          {/* Center Text */}
          <div className="max-w-xl">
            <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white">
              Book courts.
              <br />
              Play more.
              <br />
              Stress less.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              Manage reservations, organize matches, and connect with players—all
              from one modern platform built for pickleball communities.
            </p>
          </div>

          {/* Bottom Cards */}
          <div className="flex gap-4 text-white">

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-white/70">
                Players Registered
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-white/70">
                Court Booking
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-white/70">
                Mobile Friendly
              </p>
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
            <form className="grid gap-5">
              {mode === "signup" ? (
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input id="name" className="pl-8" placeholder="Alex Morgan" required />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    className="pl-8"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" ? (
                    <a
                      href="/forgot-password"
                      className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Forgot password?
                    </a>
                  ) : null}
                </div>
                <Input id="password" type="password" required />
              </div>

              {mode === "signup" && (
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" required />
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button className="w-full"><a href="/booking">{copy.submitLabel}</a></Button>
            <Button variant="outline" className="w-full">
              Continue with Google
            </Button>
            <p className="text-sm text-muted-foreground">
              {copy.footer}{" "}
              <a className="font-medium text-foreground underline-offset-4 hover:underline" href={copy.footerHref}>
                {copy.footerLink}
              </a>
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
