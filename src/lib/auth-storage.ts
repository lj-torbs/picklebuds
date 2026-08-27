export function readStorageItem<T>(
  key: string,
  guard: (value: unknown) => value is T
) {
  const raw = localStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return guard(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function persistStorageItem<T>(key: string, value: T | null) {
  if (value === null) {
    localStorage.removeItem(key)
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}
