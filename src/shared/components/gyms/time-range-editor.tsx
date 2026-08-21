import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  formatTimeRangePreview,
  type TimeRangeDraft,
  normalizeTimeRanges,
} from "@/shared/components/gyms/time-range-utils"

export function TimeRangeEditor({
  label,
  helperText,
  ranges,
  onChange,
  addLabel = "Add time range",
}: {
  label: string
  helperText: string
  ranges: TimeRangeDraft[]
  onChange: (ranges: TimeRangeDraft[]) => void
  addLabel?: string
}) {
  const validRanges = normalizeTimeRanges(ranges)

  function updateRange(index: number, update: Partial<TimeRangeDraft>) {
    onChange(
      ranges.map((range, currentIndex) =>
        currentIndex === index ? { ...range, ...update } : range
      )
    )
  }

  function addRange() {
    onChange([...ranges, { start: "", end: "" }])
  }

  function removeRange(index: number) {
    const next = ranges.filter((_, currentIndex) => currentIndex !== index)
    onChange(next.length ? next : [{ start: "", end: "" }])
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label>{label}</Label>
          <p className="text-xs text-muted-foreground">{helperText}</p>
        </div>
        <div className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          {validRanges.length} saved
        </div>
      </div>

      <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
        {ranges.map((range, index) => (
          <div
            key={`${range.start}-${range.end}-${index}`}
            className="grid gap-2 rounded-md border bg-background p-3"
          >
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`${label}-start-${index}`} className="text-xs">
                  Start
                </Label>
                <Input
                  id={`${label}-start-${index}`}
                  type="time"
                  value={range.start}
                  onChange={(event) =>
                    updateRange(index, { start: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${label}-end-${index}`} className="text-xs">
                  End
                </Label>
                <Input
                  id={`${label}-end-${index}`}
                  type="time"
                  value={range.end}
                  onChange={(event) =>
                    updateRange(index, { end: event.target.value })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Remove time range"
                  onClick={() => removeRange(index)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            {range.start && range.end ? (
              <div className="text-xs font-medium text-muted-foreground">
                {range.start < range.end
                  ? formatTimeRangePreview(range)
                  : "End time must be after start time"}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" size="sm" onClick={addRange}>
          <Plus className="size-4" aria-hidden="true" />
          {addLabel}
        </Button>
        {validRanges.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-2">
            {validRanges.map((slot) => (
              <span
                key={slot}
                className="rounded-md border bg-muted/40 px-2.5 py-1 text-xs font-medium"
              >
                {slot}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
