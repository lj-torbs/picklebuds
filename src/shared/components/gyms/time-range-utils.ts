export type TimeRangeDraft = {
  start: string
  end: string
}

function to12Hour(time: string) {
  if (!time) {
    return ""
  }

  const [hoursText, minutes] = time.split(":")
  const hours = Number(hoursText)
  const suffix = hours >= 12 ? "PM" : "AM"
  const normalizedHour = hours % 12 || 12

  return `${normalizedHour}:${minutes} ${suffix}`
}

function to24Hour(label: string) {
  if (label.includes(":") && !label.includes("AM") && !label.includes("PM")) {
    return label
  }

  const [time, suffix] = label.split(" ")
  const [hoursText, minutes] = time.split(":")
  let hours = Number(hoursText)

  if (suffix === "PM" && hours !== 12) {
    hours += 12
  }

  if (suffix === "AM" && hours === 12) {
    hours = 0
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`
}

function formatStoredSlot(range: TimeRangeDraft) {
  return `${to12Hour(range.start)} - ${to12Hour(range.end)}`
}

function parseStoredSlot(slot: string): TimeRangeDraft {
  if (slot.includes(" - ")) {
    const [startLabel, endLabel] = slot.split(" - ")
    return {
      start: to24Hour(startLabel),
      end: to24Hour(endLabel),
    }
  }

  const singleStart = to24Hour(slot)
  const [hoursText, minutesText] = singleStart.split(":")
  const date = new Date()
  date.setHours(Number(hoursText), Number(minutesText), 0, 0)
  date.setHours(date.getHours() + 1)

  const fallbackEnd = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`

  return {
    start: singleStart,
    end: fallbackEnd,
  }
}

export function formatTimeRangePreview(range: TimeRangeDraft) {
  return `${to12Hour(range.start)} - ${to12Hour(range.end)}`
}

export function normalizeTimeRanges(ranges: TimeRangeDraft[]) {
  return ranges
    .filter((range) => range.start && range.end && range.start < range.end)
    .sort((left, right) => left.start.localeCompare(right.start))
    .map(formatStoredSlot)
}

export function createTimeRangeDrafts(slots: string[]) {
  return slots.length ? slots.map(parseStoredSlot) : [{ start: "", end: "" }]
}
