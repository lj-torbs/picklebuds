import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateRangePickerProps = {
  id?: string
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
  placeholder?: string
}

const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
})
const selectedDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return new Date()
  }

  return new Date(year, month - 1, day)
}

function toDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function isWithinRange(day: Date, from: Date, to: Date) {
  const time = day.setHours(0, 0, 0, 0)
  return time >= from.setHours(0, 0, 0, 0) && time <= to.setHours(0, 0, 0, 0)
}

export function DateRangePicker({
  id,
  from,
  to,
  onChange,
  placeholder = "Select date range",
}: DateRangePickerProps) {
  const hasFrom = from.trim().length > 0
  const hasTo = to.trim().length > 0
  const fromDate = hasFrom ? parseDateValue(from) : null
  const toDate = hasTo ? parseDateValue(to) : null
  const initialMonth = fromDate ?? new Date()
  const [monthDate, setMonthDate] = useState(
    () => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  )
  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate])

  function moveMonth(offset: number) {
    setMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    )
  }

  function handleSelect(day: number) {
    const selectedDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      day
    )
    const selectedValue = toDateValue(selectedDate)

    if (!hasFrom || (hasFrom && hasTo)) {
      onChange({ from: selectedValue, to: "" })
      return
    }

    if (fromDate && selectedDate < fromDate) {
      onChange({ from: selectedValue, to: from })
      return
    }

    onChange({ from, to: selectedValue })
  }

  const triggerLabel =
    hasFrom && hasTo
      ? `${selectedDateFormatter.format(fromDate!)} - ${selectedDateFormatter.format(toDate!)}`
      : hasFrom
        ? `${selectedDateFormatter.format(fromDate!)} - End date`
        : placeholder

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 text-left font-normal"
          />
        }
      >
        <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className={cn(!hasFrom && "text-muted-foreground")}>{triggerLabel}</span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => moveMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <p className="text-sm font-medium">{monthFormatter.format(monthDate)}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => moveMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span>{hasFrom ? selectedDateFormatter.format(fromDate!) : "Start date"}</span>
          <span>{hasTo ? selectedDateFormatter.format(toDate!) : "End date"}</span>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {dayLabels.map((day) => (
            <span key={day} className="py-1">
              {day}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {monthDays.map((day, index) =>
            day === null ? (
              <span key={`blank-${index}`} className="size-9" />
            ) : (
              (() => {
                const date = new Date(
                  monthDate.getFullYear(),
                  monthDate.getMonth(),
                  day
                )
                const isBoundary =
                  (fromDate && isSameDay(fromDate, date)) ||
                  (toDate && isSameDay(toDate, date))
                const inRange =
                  fromDate && toDate ? isWithinRange(date, fromDate, toDate) : false

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelect(day)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md text-sm transition hover:bg-muted",
                      inRange && "bg-primary/10 text-primary",
                      isBoundary && "bg-primary text-primary-foreground hover:bg-primary"
                    )}
                  >
                    {day}
                  </button>
                )
              })()
            )
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange({ from: "", to: "" })}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
