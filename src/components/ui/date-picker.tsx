import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
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

export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const selectedDate = parseDateValue(value)
  const [monthDate, setMonthDate] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  )
  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate])

  function moveMonth(offset: number) {
    setMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    )
  }

  function selectDay(day: number) {
    onChange(toDateValue(new Date(monthDate.getFullYear(), monthDate.getMonth(), day)))
  }

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
        {selectedDateFormatter.format(selectedDate)}
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
              <button
                key={day}
                type="button"
                onClick={() => selectDay(day)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md text-sm transition hover:bg-muted",
                  isSameDay(
                    selectedDate,
                    new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
                  ) && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {day}
              </button>
            )
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
