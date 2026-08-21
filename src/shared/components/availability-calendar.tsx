import { cn } from "@/lib/utils"

export type AvailabilityCalendarDay = {
  value: string
  label: string
  sublabel?: string
}

export type AvailabilityCellState = "available" | "selected" | "booked" | "closed"

const stateLabel: Record<AvailabilityCellState, string> = {
  available: "Open",
  selected: "Selected",
  booked: "Booked",
  closed: "—",
}

const stateStyles: Record<AvailabilityCellState, string> = {
  available: "bg-primary/10 text-primary hover:bg-primary/20",
  selected: "bg-primary text-primary-foreground",
  booked: "cursor-not-allowed bg-muted text-muted-foreground/50 line-through",
  closed: "cursor-default bg-transparent text-muted-foreground/30",
}

/**
 * Renders a scrollable time-slot x day grid. Callers own what "available",
 * "selected", etc. mean for a given cell (booked lookups, current selection) —
 * this component only renders the grid and reports clicks back up.
 */
export function AvailabilityCalendar({
  days,
  times,
  getState,
  getLabel,
  onSelect,
  className,
}: {
  days: AvailabilityCalendarDay[]
  times: string[]
  getState: (day: string, time: string) => AvailabilityCellState
  getLabel?: (
    day: string,
    time: string,
    state: AvailabilityCellState
  ) => string | undefined
  onSelect?: (day: string, time: string) => void
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
              Time
            </th>
            {days.map((day) => (
              <th
                key={day.value}
                scope="col"
                className="min-w-[92px] border-l bg-muted/50 px-3 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                <span className="block">{day.label}</span>
                {day.sublabel ? (
                  <span className="block font-normal text-muted-foreground/80">
                    {day.sublabel}
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time} className="border-t">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-xs font-medium whitespace-nowrap text-muted-foreground"
              >
                {time}
              </th>
              {days.map((day) => {
                const state = getState(day.value, time)
                const isInteractive = Boolean(onSelect) && state !== "closed"

                return (
                  <td key={day.value} className="border-l p-1 text-center">
                    <button
                      type="button"
                      disabled={!isInteractive || state === "booked"}
                      onClick={() => onSelect?.(day.value, time)}
                      title={
                        state === "booked"
                          ? "Already booked"
                          : state === "closed"
                            ? "Not offered on this court"
                            : undefined
                      }
                      className={cn(
                        "size-full min-h-8 rounded-md text-xs font-medium transition",
                        stateStyles[state]
                      )}
                    >
                      {getLabel?.(day.value, time, state) ?? stateLabel[state]}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AvailabilityCalendarLegend({ className }: { className?: string }) {
  const items: { state: AvailabilityCellState; label: string }[] = [
    { state: "available", label: "Open" },
    { state: "selected", label: "Selected" },
    { state: "booked", label: "Booked" },
    { state: "closed", label: "Not offered" },
  ]

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 text-xs text-muted-foreground",
        className
      )}
    >
      {items.map((item) => (
        <span key={item.state} className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "size-3 rounded-sm",
              item.state === "available" && "bg-primary/10",
              item.state === "selected" && "bg-primary",
              item.state === "booked" && "bg-muted",
              item.state === "closed" && "bg-transparent ring-1 ring-inset ring-border"
            )}
          />
          {item.label}
        </span>
      ))}
    </div>
  )
}
