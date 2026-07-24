import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button-variants"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 size-80 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--background))]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:py-20">
        <div className="max-w-2xl">

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Book courts, organize players, and keep every match{" "}
            <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">on schedule</span>.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            PickleBuddy gives clubs, venues, and players one clean system for reservations, court availability, and account access.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className={buttonVariants({ size: "lg" }) + " group shadow-md shadow-primary/20"}>
              Start booking
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <BookingShowcase />
      </div>
    </section>
  )
}

function BookingShowcase() {
  return (
    <div className="relative mx-auto flex h-115 w-full max-w-md items-center justify-center" style={{ perspective: "1600px" }}>
      <style>{`
        @keyframes tilt-float {
          0%, 100% { transform: rotateY(-10deg) rotateX(8deg) translateY(0px); }
          50% { transform: rotateY(-6deg) rotateX(5deg) translateY(-12px); }
        }
        @keyframes chip-float-a {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
        }
        @keyframes chip-float-b {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(0deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -24; }
        }
        @keyframes glow-shift {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
      `}</style>

      {/* ambient glow */}
      <div
        className="absolute inset-0 -z-10 scale-90 rounded-full bg-linear-to-br from-primary/25 via-transparent to-emerald-400/20 blur-3xl"
        style={{ animation: "glow-shift 5s ease-in-out infinite" }}
      />

      {/* dotted connector line (behind card, decorative) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M 60 90 C 130 60, 180 60, 230 110"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="1 10"
          strokeLinecap="round"
          className="text-primary/40"
          style={{ animation: "dash-flow 1.5s linear infinite" }}
        />
        <path
          d="M 300 340 C 260 320, 250 300, 260 260"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="1 10"
          strokeLinecap="round"
          className="text-emerald-500/40"
          style={{ animation: "dash-flow 1.5s linear infinite" }}
        />
      </svg>

      {/* main tilted app card */}
      <div
        className="relative w-95 h-55 rounded-[1.75rem] bg-linear-to-br from-primary/40 via-border to-emerald-400/40 p-[1.5px] shadow-2xl shadow-black/20"
        style={{ transformStyle: "preserve-3d", animation: "tilt-float 6s ease-in-out infinite" }}
      >
        <div className="rounded-[1.7rem] bg-card/95 p-5 h-54 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <CalendarDays className="size-4" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Join us now!</p>
                <p className="text-xs text-muted-foreground">Start your pickleball journey</p>
              </div>
            </div>
            <span className="relative flex size-2.5">
              <span
                className="absolute inline-flex size-full rounded-full bg-emerald-500"
                style={{ animation: "pulse-ring 1.8s ease-out infinite" }}
              />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-xl border bg-background/60 p-3">
            <div className="flex -space-x-2">
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-linear-to-br from-primary to-primary/60 text-[10px] font-semibold text-primary-foreground">S</span>
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-linear-to-br from-emerald-400 to-emerald-600 text-[10px] font-semibold text-white">M</span>
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">+2</span>
            </div>
            <p className="text-xs text-muted-foreground">We welcome beginners and pros equally!</p>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Booking confirmed
            </span>
            <ArrowRight className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
