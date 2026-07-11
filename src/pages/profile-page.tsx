import {
  CalendarCheck,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"

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

export function ProfilePage() {
  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">PickleBuddy</span>
              <span className="block text-xs text-muted-foreground">Profile</span>
            </span>
          </a>
          <a href="/booking" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Book court
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <Card className="rounded-lg">
            <CardHeader className="items-center text-center">
              <span className="flex size-20 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <UserRound className="size-10" aria-hidden="true" />
              </span>
              <CardTitle>Alex Morgan</CardTitle>
              <CardDescription>Client account</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" aria-hidden="true" />
                alex@example.com
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" aria-hidden="true" />
                +63 900 123 4567
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Verified player
              </span>
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
              <CardDescription>This is a frontend-only editable form for now.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input id="profile-name" defaultValue="Alex Morgan" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" type="email" defaultValue="alex@example.com" />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input id="profile-phone" defaultValue="+63 900 123 4567" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-location">Preferred area</Label>
                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input id="profile-location" className="pl-8" defaultValue="Makati" />
                  </div>
                </div>
              </div>
              <Button className="w-fit">Save profile</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
