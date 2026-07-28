import { useMemo, useState } from "react"
import {
  CalendarCheck,
  CalendarClock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Phone,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/lib/auth-context"
import { useBookings } from "@/lib/bookings-context"
import { sanitizeText } from "@/lib/validation"
import { cn } from "@/lib/utils"

const memberSinceFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
})

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")

  return initials || "P"
}

const themeOptions = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth()
  const { bookings } = useBookings()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [location, setLocation] = useState(user?.location ?? "")

  const isDirty =
    name !== (user?.name ?? "") ||
    phone !== (user?.phone ?? "") ||
    location !== (user?.location ?? "")

  const upcomingCount = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status !== "completed" && booking.status !== "cancelled"
      ).length,
    [bookings]
  )

  const memberSince = user?.joinedAt ? new Date(user.joinedAt) : null
  const memberSinceLabel =
    memberSince && !Number.isNaN(memberSince.getTime())
      ? memberSinceFormatter.format(memberSince)
      : "This session"

  function handleLogout() {
    logout()
    navigate("/login")
  }

  function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sanitizedName = sanitizeText(name)
    if (!sanitizedName) {
      toast.add({
        title: "Full name is required",
        description: "Enter a name so other players can recognize you.",
        type: "error",
      })
      return
    }

    updateProfile({
      name: sanitizedName,
      phone: sanitizeText(phone),
      location: sanitizeText(location),
    })
    setName(sanitizedName)
    toast.add({
      title: "Profile updated",
      description: "Your contact details have been saved.",
      type: "success",
    })
  }

  function handleResetProfile() {
    setName(user?.name ?? "")
    setPhone(user?.phone ?? "")
    setLocation(user?.location ?? "")
  }

  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">PickleBuddy</span>
              <span className="block text-xs text-muted-foreground">Profile</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/booking" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Book court
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="grid gap-6 lg:self-start">
          <Card className="rounded-lg">
            <CardHeader className="items-center text-center">
              <span className="flex size-20 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-semibold text-primary">
                {user?.name ? getInitials(user.name) : <UserRound className="size-10" aria-hidden="true" />}
              </span>
              <CardTitle>{user?.name ?? "Player"}</CardTitle>
              <CardDescription>Client account</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                type="button"
                onClick={() =>
                  toast.add({
                    title: "Photo upload coming soon",
                    description: "Profile photos aren't wired up in this preview build yet.",
                    type: "success",
                  })
                }
              >
                Change photo

              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" aria-hidden="true" />
                {user?.email ?? "you@example.com"}
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" aria-hidden="true" />
                {user?.phone || "No phone on file"}
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Verified player
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="size-4" aria-hidden="true" />
                Member since {memberSinceLabel}
              </span>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardContent className="grid grid-cols-2 gap-3 pt-6">
              <div className="rounded-lg bg-muted p-3">
                <span className="block text-xs text-muted-foreground">Upcoming</span>
                <span className="mt-1 block text-2xl font-semibold">{upcomingCount}</span>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <span className="block text-xs text-muted-foreground">Total bookings</span>
                <span className="mt-1 block text-2xl font-semibold">{bookings.length}</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="grid gap-6">
          <div>
            <p className="text-sm font-medium text-primary">Account settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Profile
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage the contact details that will be used for booking updates and court reminders.
            </p>
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
              <CardDescription>These details are saved to your account on this device.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSaveProfile}>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="profile-name">Full name</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" type="email" value={user?.email ?? ""} disabled />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change the email on your account.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input
                      id="profile-phone"
                      placeholder="+63 900 123 4567"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile-location">Preferred area</Label>
                    <div className="relative">
                      <MapPin
                        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        id="profile-location"
                        className="pl-8"
                        placeholder="Makati"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" disabled={!isDirty}>
                    Save profile
                  </Button>
                  {isDirty ? (
                    <Button type="button" variant="ghost" onClick={handleResetProfile}>
                      Discard changes
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose how PickleBuddy looks on this device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="inline-flex rounded-lg border bg-muted p-1">
                {themeOptions.map((option) => {
                  const isActive = theme === option.value
                  const Icon = option.icon

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
                        isActive
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-destructive/30">
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>Sign out of this device or remove your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </Button>
              <Button
                variant="destructive"
                type="button"
                disabled
                title="Account deletion isn't available in this preview build yet"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete account
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
