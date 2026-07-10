import { CalendarDays, CheckCircle2, Users } from "lucide-react"

const steps = [
  {
    icon: CalendarDays,
    text: "Players choose a date, court, and time slot.",
  },
  {
    icon: Users,
    text: "The system keeps availability clear before checkout or confirmation.",
  },
  {
    icon: CheckCircle2,
    text: "Bookings appear in one venue schedule for staff and players.",
  },
]

export function LandingWorkflow() {
  return (
    <section id="workflow" className="relative overflow-hidden border-y py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 right-1/4 size-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From open slot to{" "}
            <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              confirmed game
            </span>{" "}
            with fewer back-and-forth messages.
          </h2>
        </div>

        <div className="relative grid gap-4">
          {/* connecting line through the steps */}
          <div
            className="absolute top-9 bottom-9 `left-4.5 hidden w-px bg-linear-to-b from-primary/40 via-border to-emerald-400/40 sm:block"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <div
              key={step.text}
              className="group relative rounded-2xl bg-linear-to-br from-primary/25 via-border to-emerald-400/25 p-[1.5px] shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start gap-4 rounded-[0.95rem] bg-card/90 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-4 ring-card">
                  <step.icon className="size-4.5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
