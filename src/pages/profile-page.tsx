import { useMemo, useRef, useState } from "react"
import {
  CalendarClock,
  Camera,
  Loader2,
  LogOut,
  Mail,
  Map,
  MapPin,
  Monitor,
  Moon,
  Navigation,
  Phone,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"
import { useToast } from "@/components/ui/toast"
import {
  deletePlayerAvatarWithApi,
  getAuthErrorMessage,
  resolveApiMediaUrl,
  updatePlayerProfileWithApi,
  uploadPlayerAvatarWithApi,
} from "@/lib/auth-api"
import { useAuth } from "@/lib/auth-context"
import { useBookings } from "@/lib/bookings-context"
import { sanitizeText } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { PlayerHeader } from "@/shared/components/player/player-header"

const memberSinceFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
})

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")

  return initials || "P"
}

const themeOptions = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

type Coordinates = {
  lat: number
  lng: number
}

const defaultMapCenter: Coordinates = {
  lat: 14.5547,
  lng: 121.0244,
}

const mapPresets: Array<{ label: string; center: Coordinates }> = [
  { label: "Tagum", center: { lat: 7.4478, lng: 125.8078 } },
  { label: "Carmen", center: { lat: 7.3606, lng: 125.7064 } },
  { label: "Panabo", center: { lat: 7.3081, lng: 125.6841 } },
  { label: "Mawab", center: { lat: 7.5081, lng: 125.9367 } },
  { label: "Nabunturan", center: { lat: 7.6078, lng: 125.9664 } },
]

const mapZoom = 12
const tileSize = 256
const mapWidth = 640
const mapHeight = 288

function lonToGlobalPixel(lng: number, zoom: number) {
  return ((lng + 180) / 360) * tileSize * 2 ** zoom
}

function latToGlobalPixel(lat: number, zoom: number) {
  const latRadians = (lat * Math.PI) / 180
  return (
    ((1 -
      Math.log(Math.tan(latRadians) + 1 / Math.cos(latRadians)) / Math.PI) /
      2) *
    tileSize *
    2 ** zoom
  )
}

function globalPixelToLng(pixelX: number, zoom: number) {
  return (pixelX / (tileSize * 2 ** zoom)) * 360 - 180
}

function globalPixelToLat(pixelY: number, zoom: number) {
  const value = Math.PI - (2 * Math.PI * pixelY) / (tileSize * 2 ** zoom)
  return (Math.atan(Math.sinh(value)) * 180) / Math.PI
}

function getAreaLabelFromAddress(address: Record<string, string> | undefined) {
  if (!address) return ""
  const primary =
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.city_district ||
    address.city ||
    address.town ||
    address.municipality ||
    address.village
  const region = address.state || address.region || address.province
  const country = address.country

  return [primary, region, country].filter(Boolean).join(", ")
}

async function resolveLocationLabel(coords: Coordinates) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&zoom=14&addressdetails=1`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  )

  if (!response.ok) {
    throw new Error("Unable to resolve address.")
  }

  const payload = (await response.json()) as {
    display_name?: string
    address?: Record<string, string>
  }
  return (
    getAreaLabelFromAddress(payload.address) ||
    payload.display_name ||
    `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
  )
}

function LocationMapPicker({
  center,
  isResolving,
  onCenterChange,
  onPick,
}: {
  center: Coordinates
  isResolving: boolean
  onCenterChange: (coords: Coordinates) => void
  onPick: (coords: Coordinates) => void
}) {
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    startCenterX: number
    startCenterY: number
    moved: boolean
  } | null>(null)
  const centerX = lonToGlobalPixel(center.lng, mapZoom)
  const centerY = latToGlobalPixel(center.lat, mapZoom)
  const topLeftX = centerX - mapWidth / 2
  const topLeftY = centerY - mapHeight / 2
  const maxTile = 2 ** mapZoom
  const tiles = []

  const startTileX = Math.floor(topLeftX / tileSize)
  const endTileX = Math.floor((topLeftX + mapWidth) / tileSize)
  const startTileY = Math.floor(topLeftY / tileSize)
  const endTileY = Math.floor((topLeftY + mapHeight) / tileSize)

  for (let x = startTileX; x <= endTileX; x += 1) {
    for (let y = startTileY; y <= endTileY; y += 1) {
      if (y < 0 || y >= maxTile) continue
      const wrappedX = ((x % maxTile) + maxTile) % maxTile
      tiles.push({
        key: `${x}-${y}`,
        x,
        y,
        wrappedX,
        left: x * tileSize - topLeftX,
        top: y * tileSize - topLeftY,
      })
    }
  }

  function getCoordsFromPointer(
    event: React.PointerEvent<HTMLDivElement>,
    element: HTMLDivElement
  ) {
    const rect = element.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    return {
      lat: globalPixelToLat(topLeftY + clickY, mapZoom),
      lng: globalPixelToLng(topLeftX + clickX, mapZoom),
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startCenterX: centerX,
      startCenterY: centerY,
      moved: false,
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      drag.moved = true
    }

    if (!drag.moved) return

    onCenterChange({
      lat: globalPixelToLat(drag.startCenterY - deltaY, mapZoom),
      lng: globalPixelToLng(drag.startCenterX - deltaX, mapZoom),
    })
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)

    if (drag.moved) {
      onPick({
        lat: globalPixelToLat(
          drag.startCenterY - (event.clientY - drag.startY),
          mapZoom
        ),
        lng: globalPixelToLng(
          drag.startCenterX - (event.clientX - drag.startX),
          mapZoom
        ),
      })
      return
    }

    onPick(getCoordsFromPointer(event, event.currentTarget))
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragRef.current = null
      }}
      className="relative h-72 w-full touch-none overflow-hidden rounded-lg border bg-muted text-left"
      aria-label="Pick preferred area on map"
    >
      {tiles.map((tile) => (
        <img
          key={tile.key}
          src={`https://tile.openstreetmap.org/${mapZoom}/${tile.wrappedX}/${tile.y}.png`}
          alt=""
          className="absolute max-w-none select-none"
          draggable={false}
          style={{
            left: tile.left,
            top: tile.top,
            width: tileSize,
            height: tileSize,
          }}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background">
        <MapPin className="size-5" aria-hidden="true" />
      </span>
      {isResolving ? (
        <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-md bg-background/95 px-3 py-2 text-sm font-medium shadow-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Resolving area...
        </span>
      ) : (
        <span className="absolute bottom-3 left-3 rounded-md bg-background/95 px-3 py-1.5 text-xs font-medium shadow-sm">
          Click or drag the map to set your preferred area
        </span>
      )}
      <span className="absolute bottom-3 right-3 rounded bg-background/90 px-2 py-1 text-[10px] text-muted-foreground">
        OpenStreetMap
      </span>
    </div>
  )
}

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth()
  const { bookings } = useBookings()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [location, setLocation] = useState(user?.location ?? "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "")
  const [openPlayAnnouncementsEnabled, setOpenPlayAnnouncementsEnabled] =
    useState(user?.openPlayAnnouncementsEnabled ?? false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isResolvingMap, setIsResolvingMap] = useState(false)
  const [mapCenter, setMapCenter] = useState<Coordinates>(defaultMapCenter)
  const displayAvatarUrl = resolveApiMediaUrl(avatarUrl)

  const isDirty =
    name !== (user?.name ?? "") ||
    phone !== (user?.phone ?? "") ||
    location !== (user?.location ?? "") ||
    avatarUrl !== (user?.avatarUrl ?? "") ||
    openPlayAnnouncementsEnabled !== (user?.openPlayAnnouncementsEnabled ?? false)

  const upcomingCount = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status !== "completed" && booking.status !== "cancelled"
      ).length,
    [bookings]
  )

  const memberSince = user?.joinedAt ? new Date(user.joinedAt) : null
  const memberSinceLabel =
    memberSince && !Number.isNaN(memberSince.getTime())
      ? memberSinceFormatter.format(memberSince)
      : "This session"
  const profileCompletion = Math.round(
    ([name, phone, location, avatarUrl].filter(Boolean).length / 4) * 100
  )
  const accountDetails = [
    {
      label: "Email",
      value: user?.email ?? "you@example.com",
      icon: Mail,
    },
    {
      label: "Phone",
      value: user?.phone || "No phone on file",
      icon: Phone,
    },
    {
      label: "Preferred area",
      value: user?.location || "No area selected",
      icon: MapPin,
    },
    {
      label: "Member since",
      value: memberSinceLabel,
      icon: CalendarClock,
    },
  ]

  function handleLogout() {
    logout()
    navigate("/login")
  }

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const sanitizedName = sanitizeText(name)
    if (!sanitizedName) {
      toast.add({
        title: "Full name is required",
        description: "Enter a name so other players can recognize you.",
        type: "error",
      })
      return
    }

    if (!user?.token) {
      toast.add({
        title: "Sign in again",
        description: "Your session is missing. Please log in again before saving.",
        type: "error",
      })
      return
    }

    const sanitizedPhone = sanitizeText(phone)
    const sanitizedLocation = sanitizeText(location)

    setIsSavingProfile(true)
    try {
      const updated = await updatePlayerProfileWithApi(user.token, {
        full_name: sanitizedName,
        phone: sanitizedPhone || null,
        location: sanitizedLocation || null,
        open_play_announcements_enabled: openPlayAnnouncementsEnabled,
      })
      updateProfile({
        name: updated.full_name,
        phone: updated.phone ?? undefined,
        location: updated.location ?? undefined,
        avatarUrl: updated.avatar_url ?? undefined,
        openPlayAnnouncementsEnabled:
          updated.open_play_announcements_enabled ?? false,
      })
      setName(updated.full_name)
      setPhone(updated.phone ?? "")
      setLocation(updated.location ?? "")
      setAvatarUrl(updated.avatar_url ?? avatarUrl)
      setOpenPlayAnnouncementsEnabled(
        updated.open_play_announcements_enabled ?? false
      )
      toast.add({
        title: "Profile updated",
        description: "Your contact details have been saved.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Unable to update profile",
        description: getAuthErrorMessage(error, "Please try again."),
        type: "error",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  function handleResetProfile() {
    setName(user?.name ?? "")
    setPhone(user?.phone ?? "")
    setLocation(user?.location ?? "")
    setAvatarUrl(user?.avatarUrl ?? "")
    setOpenPlayAnnouncementsEnabled(user?.openPlayAnnouncementsEnabled ?? false)
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Choose an image file",
        description: "Profile photos must be JPG, PNG, or another image format.",
        type: "error",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.add({
        title: "Photo is too large",
        description: "Use an image under 2 MB for this upload.",
        type: "error",
      })
      return
    }

    if (!user?.token) {
      toast.add({
        title: "Sign in again",
        description: "Your session is missing. Please log in again before uploading.",
        type: "error",
      })
      return
    }

    setIsUploadingPhoto(true)
    try {
      const updated = await uploadPlayerAvatarWithApi(user.token, file)
      const nextAvatarUrl = updated.avatar_url ?? ""
      setAvatarUrl(nextAvatarUrl)
      updateProfile({
        name: updated.full_name,
        phone: updated.phone ?? undefined,
        location: updated.location ?? undefined,
        avatarUrl: nextAvatarUrl || undefined,
        openPlayAnnouncementsEnabled:
          updated.open_play_announcements_enabled ?? false,
      })
      toast.add({
        title: "Profile photo updated",
        description: "Your new photo has been saved.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Unable to upload photo",
        description: getAuthErrorMessage(error, "Please try another image."),
        type: "error",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  async function handleRemovePhoto() {
    if (!user?.token) {
      toast.add({
        title: "Sign in again",
        description: "Your session is missing. Please log in again before removing.",
        type: "error",
      })
      return
    }

    setIsUploadingPhoto(true)
    try {
      const updated = await deletePlayerAvatarWithApi(user.token)
      setAvatarUrl("")
      updateProfile({
        name: updated.full_name,
        phone: updated.phone ?? undefined,
        location: updated.location ?? undefined,
        avatarUrl: undefined,
        openPlayAnnouncementsEnabled:
          updated.open_play_announcements_enabled ?? false,
      })
      toast.add({
        title: "Profile photo removed",
        description: "Your profile photo has been removed.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Unable to remove photo",
        description: getAuthErrorMessage(error, "Please try again."),
        type: "error",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  async function applyCoordinates(coords: Coordinates, source: "browser" | "map") {
    setMapCenter(coords)
    if (source === "map") setIsResolvingMap(true)

    try {
      const label = await resolveLocationLabel(coords)
      setLocation(label)
      toast.add({
        title: "Preferred area selected",
        description: label,
        type: "success",
      })
    } catch {
      const fallback = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      setLocation(fallback)
      toast.add({
        title: "Location selected",
        description:
          "We saved the coordinates. You can edit the area name before saving your profile.",
        type: "success",
      })
    } finally {
      if (source === "map") setIsResolvingMap(false)
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.add({
        title: "Location is not supported",
        description: "Your browser does not support location detection.",
        type: "error",
      })
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void applyCoordinates(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          "browser"
        ).finally(() => setIsLocating(false))
      },
      () => {
        setIsLocating(false)
        toast.add({
          title: "Location permission needed",
          description:
            "Allow location access in your browser, or pick your area on the map.",
          type: "error",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  function handlePresetArea(center: Coordinates, label: string) {
    setMapCenter(center)
    setLocation(label)
  }

  return (
    <main className="min-h-svh bg-muted/30">
      <PlayerHeader token={user?.token} />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6">
        <Card className="overflow-hidden rounded-lg border bg-background">
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-primary/10 text-3xl font-semibold text-primary">
                {displayAvatarUrl ? (
                  <img
                    src={displayAvatarUrl}
                    alt={`${user?.name ?? "Player"} profile`}
                    className="size-full object-cover"
                  />
                ) : user?.name ? (
                  getInitials(user.name)
                ) : (
                  <UserRound className="size-12" aria-hidden="true" />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-md bg-background/95 text-foreground shadow-sm ring-1 ring-border transition hover:bg-muted"
                  aria-label="Upload profile photo"
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <span className="size-3 animate-pulse rounded-full bg-primary" />
                  ) : (
                    <Camera className="size-4" aria-hidden="true" />
                  )}
                </button>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">Player profile</p>
                <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight">
                  {user?.name ?? "Player"}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{user?.email ?? "you@example.com"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Verified player
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" aria-hidden="true" />
                    {isUploadingPhoto ? "Uploading..." : "Upload photo"}
                  </Button>
                  {avatarUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={handleRemovePhoto}
                    >
                      Remove photo
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-2 text-center sm:min-w-80">
              <div className="rounded-md bg-background p-3">
                <span className="block text-xs text-muted-foreground">Profile</span>
                <span className="mt-1 block text-lg font-semibold">
                  {profileCompletion}%
                </span>
              </div>
              <div className="rounded-md bg-background p-3">
                <span className="block text-xs text-muted-foreground">Upcoming</span>
                <span className="mt-1 block text-lg font-semibold">{upcomingCount}</span>
              </div>
              <div className="rounded-md bg-background p-3">
                <span className="block text-xs text-muted-foreground">Bookings</span>
                <span className="mt-1 block text-lg font-semibold">{bookings.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="grid content-start gap-5">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Account summary</CardTitle>
                <CardDescription>Your booking identity and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {accountDetails.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-md border bg-muted/20 p-3"
                  >
                    <span className="flex size-9 items-center justify-center rounded-md bg-background text-muted-foreground">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="block truncate text-sm font-medium">
                        {item.value}
                      </span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose how PickleBuddy looks on this device.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {themeOptions.map((option) => {
                    const isActive = theme === option.value
                    const Icon = option.icon

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-medium transition",
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="size-4" aria-hidden="true" />
                          {option.label}
                        </span>
                        {isActive ? (
                          <span className="text-xs font-semibold">Active</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid content-start gap-5">
            <Card className="rounded-lg">
              <CardHeader className="border-b">
                <CardTitle>Personal details</CardTitle>
                <CardDescription>
                  Keep your booking contact information current.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form className="grid gap-5" onSubmit={handleSaveProfile}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="profile-name">Full name</Label>
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="profile-email">Email</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={user?.email ?? ""}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact support to change the email on your account.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="profile-phone">Phone</Label>
                      <Input
                        id="profile-phone"
                        placeholder="+63 900 123 4567"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="profile-location">Preferred area</Label>
                      <div className="relative">
                        <MapPin
                          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id="profile-location"
                          className="pl-8"
                          placeholder="Makati"
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="text-sm font-semibold">Choose area from location</p>
                        <p className="text-xs text-muted-foreground">
                          Use your device location or click the map to fill your preferred area.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLocating}
                        onClick={handleUseCurrentLocation}
                      >
                        {isLocating ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Navigation className="size-4" aria-hidden="true" />
                        )}
                        {isLocating ? "Locating..." : "Use my location"}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mapPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handlePresetArea(preset.center, preset.label)}
                          className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Map className="size-4" aria-hidden="true" />
                        Map picker
                      </div>
                      <LocationMapPicker
                        center={mapCenter}
                        isResolving={isResolvingMap}
                        onCenterChange={setMapCenter}
                        onPick={(coords) => {
                          void applyCoordinates(coords, "map")
                        }}
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition hover:border-primary/50">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded border-border accent-primary"
                      checked={openPlayAnnouncementsEnabled}
                      onChange={(event) =>
                        setOpenPlayAnnouncementsEnabled(event.target.checked)
                      }
                    />
                    <span className="grid gap-1">
                      <span className="text-sm font-semibold">
                        Allow Open Play announcements
                      </span>
                      <span className="text-xs leading-5 text-muted-foreground">
                        Receive notifications when another player is looking for
                        additional players in an Open Play session.
                      </span>
                    </span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                    <Button type="submit" disabled={!isDirty || isSavingProfile}>
                      {isSavingProfile ? "Saving..." : "Save profile"}
                    </Button>
                    {isDirty ? (
                      <Button type="button" variant="ghost" onClick={handleResetProfile}>
                        Discard changes
                      </Button>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-destructive/30">
              <CardHeader>
                <CardTitle>Account access</CardTitle>
                <CardDescription>
                  Sign out of this device or manage account-level actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  disabled
                  title="Account deletion is currently unavailable"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
