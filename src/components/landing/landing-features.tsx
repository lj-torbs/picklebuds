import { Bell, CalendarClock, ShieldCheck, UsersRound } from "lucide-react"

const features = [
  {
    icon: CalendarClock,
    title: "Live court schedules",
    text: "Show available courts, booked slots, and league blocks without spreadsheet work.",
    tint: "bg-primary/15 text-primary",
  },
  {
    icon: UsersRound,
    title: "Player-friendly accounts",
    text: "Let players sign up, log in, and keep their reservations tied to one profile.",
    tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Bell,
    title: "Booking visibility",
    text: "Surface upcoming matches, court assignments, and status changes clearly.",
    tint: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  },
  {
    icon: ShieldCheck,
    title: "Operational control",
    text: "Give venues a clean foundation for approvals, payments, and admin tools later.",
    tint: "bg-primary/15 text-primary",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="ml-auto max-w-1xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Designed for the daily rhythm of{" "}
            <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              pickleball venues
            </span>
            .
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl bg-linear-to-br from-primary/25 via-border to-emerald-400/25 p-[1.5px] shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="h-full rounded-[0.95rem] bg-card/90 p-5 backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1">
                <span className={`inline-flex size-10 items-center justify-center rounded-xl ${feature.tint}`}>
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
