import {
  Check,
  LayoutDashboard,
  ListChecks,
  Menu,
  PanelLeft,
  RefreshCcw,
  Save,
  Upload,
} from "lucide-react"
import { useEffect, useMemo, useState, type ChangeEvent } from "react"

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
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  buildOwnerBrandingStyle,
  type OwnerBrandingConfig,
  type OwnerBrandingDensity,
  type OwnerNavigationLayout,
  type OwnerBrandingStyle,
  useOwnerBranding,
} from "@/owner/lib/owner-branding-context"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"

type ThemePreset = {
  id: string
  name: string
  description: string
  values: Pick<
    OwnerBrandingConfig,
    "primaryColor" | "sidebarColor" | "surfaceColor" | "style" | "density"
  >
}

const themePresets: ThemePreset[] = [
  {
    id: "private-club",
    name: "Private Club",
    description: "Deep green shell with a quiet premium feel.",
    values: {
      primaryColor: "#22c55e",
      sidebarColor: "#10231a",
      surfaceColor: "#f7fbf6",
      style: "soft",
      density: "comfortable",
    },
  },
  {
    id: "emerald-league",
    name: "Emerald League",
    description: "Polished green and ink interface for competitive clubs.",
    values: {
      primaryColor: "#16a34a",
      sidebarColor: "#052e16",
      surfaceColor: "#f2fbf5",
      style: "executive",
      density: "comfortable",
    },
  },
  {
    id: "city-arena",
    name: "City Arena",
    description: "Modern navy interface for busier operators.",
    values: {
      primaryColor: "#2563eb",
      sidebarColor: "#0f172a",
      surfaceColor: "#f6f8fc",
      style: "executive",
      density: "compact",
    },
  },
  {
    id: "courtside-minimal",
    name: "Courtside Minimal",
    description: "Neutral, bright, and restrained for simple operations.",
    values: {
      primaryColor: "#0f766e",
      sidebarColor: "#1f2937",
      surfaceColor: "#f9fafb",
      style: "soft",
      density: "compact",
    },
  },
  {
    id: "community-play",
    name: "Community Play",
    description: "Warm accent colors for social clubs and leagues.",
    values: {
      primaryColor: "#d97706",
      sidebarColor: "#302014",
      surfaceColor: "#fffaf2",
      style: "vivid",
      density: "comfortable",
    },
  },
  {
    id: "sunrise-open",
    name: "Sunrise Open",
    description: "Fresh coral and blue accents for morning-heavy venues.",
    values: {
      primaryColor: "#f97316",
      sidebarColor: "#1e3a5f",
      surfaceColor: "#fff7ed",
      style: "vivid",
      density: "comfortable",
    },
  },
  {
    id: "pacific-court",
    name: "Pacific Court",
    description: "Coastal blue with clean surfaces for premium arenas.",
    values: {
      primaryColor: "#0284c7",
      sidebarColor: "#0c2438",
      surfaceColor: "#f0f9ff",
      style: "executive",
      density: "comfortable",
    },
  },
  {
    id: "court-lab",
    name: "Court Lab",
    description: "Crisp teal system for a technical operations feel.",
    values: {
      primaryColor: "#0891b2",
      sidebarColor: "#123044",
      surfaceColor: "#f4fafb",
      style: "executive",
      density: "comfortable",
    },
  },
  {
    id: "carbon-pro",
    name: "Carbon Pro",
    description: "Dark graphite navigation with sharp lime highlights.",
    values: {
      primaryColor: "#84cc16",
      sidebarColor: "#111827",
      surfaceColor: "#f8fafc",
      style: "executive",
      density: "compact",
    },
  },
  {
    id: "royal-indoor",
    name: "Royal Indoor",
    description: "Indigo and gold-inspired controls for upscale courts.",
    values: {
      primaryColor: "#4f46e5",
      sidebarColor: "#1e1b4b",
      surfaceColor: "#f7f7ff",
      style: "executive",
      density: "comfortable",
    },
  },
  {
    id: "clay-and-sky",
    name: "Clay and Sky",
    description: "Terracotta with calm blue-gray structure.",
    values: {
      primaryColor: "#c2410c",
      sidebarColor: "#334155",
      surfaceColor: "#fff7ed",
      style: "soft",
      density: "comfortable",
    },
  },
  {
    id: "night-match",
    name: "Night Match",
    description: "Deep midnight shell with electric court accents.",
    values: {
      primaryColor: "#06b6d4",
      sidebarColor: "#020617",
      surfaceColor: "#f3f8fb",
      style: "vivid",
      density: "compact",
    },
  },
  {
    id: "academy",
    name: "Academy",
    description: "Trustworthy blue and slate styling for training centers.",
    values: {
      primaryColor: "#2563eb",
      sidebarColor: "#1e293b",
      surfaceColor: "#f8fafc",
      style: "soft",
      density: "comfortable",
    },
  },
  {
    id: "wellness-club",
    name: "Wellness Club",
    description: "Soft mint and charcoal for approachable community gyms.",
    values: {
      primaryColor: "#10b981",
      sidebarColor: "#1f3a32",
      surfaceColor: "#f3fbf8",
      style: "soft",
      density: "comfortable",
    },
  },
  {
    id: "fiesta-cup",
    name: "Fiesta Cup",
    description: "Bright tournament styling with energetic pink accents.",
    values: {
      primaryColor: "#db2777",
      sidebarColor: "#312e81",
      surfaceColor: "#fff5f8",
      style: "vivid",
      density: "comfortable",
    },
  },
  {
    id: "halloween-rally",
    name: "Halloween Rally",
    description: "Seasonal Halloween look with pumpkin accents and dark shell.",
    values: {
      primaryColor: "#f97316",
      sidebarColor: "#1c1917",
      surfaceColor: "#fff7ed",
      style: "vivid",
      density: "compact",
    },
  },
  {
    id: "christmas-classic",
    name: "Christmas Classic",
    description: "Seasonal Christmas palette with pine and berry tones.",
    values: {
      primaryColor: "#dc2626",
      sidebarColor: "#14532d",
      surfaceColor: "#f7fbf6",
      style: "vivid",
      density: "comfortable",
    },
  },
  {
    id: "new-year-lights",
    name: "New Year Lights",
    description: "Celebration-ready navy with bright gold action color.",
    values: {
      primaryColor: "#eab308",
      sidebarColor: "#0f172a",
      surfaceColor: "#f8fafc",
      style: "executive",
      density: "comfortable",
    },
  },
  {
    id: "valentine-match",
    name: "Valentine Match",
    description: "Seasonal rose theme for promos, events, and doubles nights.",
    values: {
      primaryColor: "#e11d48",
      sidebarColor: "#4c1d2f",
      surfaceColor: "#fff1f4",
      style: "soft",
      density: "comfortable",
    },
  },
]

const densityOptions: Array<{
  value: OwnerBrandingDensity
  label: string
  description: string
}> = [
  {
    value: "comfortable",
    label: "Comfortable",
    description: "More breathing room for daily management.",
  },
  {
    value: "compact",
    label: "Compact",
    description: "Denser screens for frequent operators.",
  },
]

const styleOptions: Array<{
  value: OwnerBrandingStyle
  label: string
  description: string
}> = [
  {
    value: "soft",
    label: "Soft",
    description: "Light surfaces with restrained contrast.",
  },
  {
    value: "vivid",
    label: "Vivid",
    description: "Stronger accents and more visual energy.",
  },
  {
    value: "executive",
    label: "Executive",
    description: "Sharper contrast and quieter surfaces.",
  },
]

const navigationLayoutOptions: Array<{
  value: OwnerNavigationLayout
  label: string
  description: string
  icon: typeof PanelLeft
}> = [
  {
    value: "sidebar",
    label: "Sidebar",
    description: "Persistent left navigation with collapse control.",
    icon: PanelLeft,
  },
  {
    value: "navbar",
    label: "Top navbar",
    description: "Horizontal navigation below the owner header.",
    icon: Menu,
  },
]

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error("Unable to read the selected file."))
    }

    reader.onerror = () => {
      reject(new Error("Unable to read the selected file."))
    }

    reader.readAsDataURL(file)
  })
}

function presetIsSelected(preset: ThemePreset, draft: OwnerBrandingConfig) {
  return (
    preset.values.primaryColor === draft.primaryColor &&
    preset.values.sidebarColor === draft.sidebarColor &&
    preset.values.surfaceColor === draft.surfaceColor &&
    preset.values.style === draft.style &&
    preset.values.density === draft.density
  )
}

function LogoMark({
  brandLabel,
  imageUrl,
  className,
}: {
  brandLabel: string
  imageUrl: string | null
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground shadow-xs",
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${brandLabel} logo`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm font-semibold">
          {brandLabel.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  )
}

function PresetCard({
  preset,
  selected,
  onSelect,
}: {
  preset: ThemePreset
  selected: boolean
  onSelect: () => void
}) {
  const previewStyle = buildOwnerBrandingStyle({
    brandName: preset.name,
    logoImageUrl: null,
    navigationLayout: "sidebar",
    dashboardPanels: ["recent-transactions"],
    ...preset.values,
  })

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "grid gap-3 rounded-lg border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-muted/25",
        selected && "border-primary bg-primary/5 ring-1 ring-primary/25"
      )}
    >
      <div
        style={previewStyle}
        className="overflow-hidden rounded-md border bg-background"
      >
        <div className="grid h-24 grid-cols-[4.25rem_1fr]">
          <div
            className="grid content-start gap-2 p-2"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--sidebar) 90%, var(--primary) 10%) 0%, var(--sidebar) 100%)",
            }}
          >
            <span className="size-7 rounded-md bg-sidebar-primary" />
            <span className="h-1.5 rounded bg-sidebar-accent" />
            <span className="h-1.5 rounded bg-sidebar-foreground/20" />
            <span className="h-1.5 rounded bg-sidebar-foreground/20" />
          </div>
          <div className="grid grid-rows-[1.75rem_1fr] bg-background">
            <div className="border-b bg-card px-2 py-1">
              <span className="block h-2 w-20 rounded bg-primary/25" />
            </div>
            <div className="grid gap-2 p-2">
              <span className="h-5 rounded-md border bg-card" />
              <div className="grid grid-cols-2 gap-2">
                <span className="h-7 rounded-md border bg-card" />
                <span className="h-7 rounded-md border bg-primary/12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{preset.name}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {preset.description}
          </p>
        </div>
        {selected ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </button>
  )
}

function WorkspacePreview({
  draft,
  ownerEmail,
}: {
  draft: OwnerBrandingConfig
  ownerEmail?: string
}) {
  const previewStyle = buildOwnerBrandingStyle(draft)
  const name = draft.brandName.trim() || "Owner"

  return (
    <div
      style={previewStyle}
      className="overflow-hidden rounded-lg border bg-background shadow-sm"
    >
      <div className="grid min-h-[34rem] grid-cols-[9rem_1fr] bg-background">
        <aside
          className="flex flex-col border-r border-sidebar-border p-3 text-sidebar-foreground"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--sidebar) 90%, var(--primary) 10%) 0%, var(--sidebar) 48%, color-mix(in srgb, var(--sidebar) 92%, var(--background) 8%) 100%)",
          }}
        >
          <div className="grid gap-3 border-b border-sidebar-border pb-4">
            <span className="text-[10px] font-medium text-sidebar-foreground/50 uppercase">
              Management
            </span>
            <div className="flex items-center gap-2">
              <LogoMark
                brandLabel={name}
                imageUrl={draft.logoImageUrl}
                className="size-10"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{name}</p>
                <p className="truncate text-[10px] text-sidebar-foreground/55">
                  Venue suite
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-4 grid gap-1.5">
            {[
              "Dashboard",
              "My Gyms",
              "Payment Methods",
              "Transactions",
              "Configuration",
            ].map((item, index) => (
              <div
                key={item}
                className={cn(
                  "rounded-md px-2 py-2 text-[11px]",
                  index === 0
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70"
                )}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-md border border-sidebar-border/70 px-2 py-2 text-[10px] text-sidebar-foreground/55">
            Powered by PickleBuddy
          </div>
        </aside>

        <section className="grid grid-rows-[auto_1fr_auto]">
          <header className="flex items-center justify-between gap-3 border-b bg-card px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Dashboard</p>
              <p className="text-xs text-muted-foreground">{name}</p>
            </div>
            <div className="hidden rounded-md border bg-background px-2 py-1 text-[11px] text-muted-foreground sm:block">
              {ownerEmail ?? "owner account"}
            </div>
          </header>

          <div className="grid content-start gap-3 p-4">
            <div
              className="rounded-lg border bg-card p-4"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--primary) 13%, var(--card)), var(--card) 72%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <LayoutDashboard className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold">{name} venues</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bookings, payments, and court operations.
                  </p>
                </div>
              </div>
            </div>

            {draft.dashboardPanels.includes("recent-transactions") ? (
              <div className="rounded-lg border bg-card p-3">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <ListChecks
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  Recent transactions
                </div>
                <div className="grid gap-2">
                  {["Ramos booking", "Cruz open play", "Lim whole gym"].map(
                    (item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-md border bg-background px-2 py-1.5 text-[11px]"
                      >
                        <span>{item}</span>
                        <span
                          className={
                            index === 0
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          {index === 0 ? "Review" : "Paid"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : null}

          </div>

          <footer className="border-t px-4 py-3 text-[11px] text-muted-foreground">
            Powered by PickleBuddy
          </footer>
        </section>
      </div>
    </div>
  )
}

export function OwnerConfigurationPage() {
  const { owner } = useOwnerAuth()
  const toast = useToast()
  const { branding, brandLabel, setBranding, resetBranding } =
    useOwnerBranding()
  const [draft, setDraft] = useState<OwnerBrandingConfig>(branding)
  const [isSaving, setIsSaving] = useState(false)

  const selectedPreset = useMemo(
    () => themePresets.find((preset) => presetIsSelected(preset, draft)),
    [draft]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Draft should reset when the persisted owner branding changes.
    setDraft(branding)
  }, [branding])

  function updateDraft<K extends keyof OwnerBrandingConfig>(
    key: K,
    value: OwnerBrandingConfig[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      updateDraft("logoImageUrl", await readFileAsDataUrl(file))
    } catch (error) {
      toast.add({
        title: "Unable to read image",
        description:
          error instanceof Error ? error.message : "Please try another file.",
        type: "error",
      })
    }

    event.target.value = ""
  }

  function handleSave() {
    setIsSaving(true)
    setBranding(draft)
    toast.add({
      title: "Configuration updated",
      description: "Your owner workspace branding has been saved.",
      type: "success",
    })
    window.setTimeout(() => setIsSaving(false), 250)
  }

  function handleReset() {
    resetBranding()
    toast.add({
      title: "Configuration reset",
      description: "Owner branding returned to the default setup.",
      type: "success",
    })
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-lg border bg-card p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Configuration</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Brand kit for {brandLabel}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Set the owner workspace identity, choose a professional interface
            preset, and tune the core colors used across the management area.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={handleReset}>
            <RefreshCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            <Save className="size-4" aria-hidden="true" />
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="grid gap-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Workspace identity</CardTitle>
              <CardDescription>
                This replaces PickleBuddy as the primary owner-side brand.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="grid content-start gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="brand-name">Workspace name</Label>
                  <Input
                    id="brand-name"
                    value={draft.brandName}
                    onChange={(event) =>
                      updateDraft("brandName", event.target.value)
                    }
                    placeholder={owner?.name ?? "Owner"}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logo-upload">Logo</Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handleImageChange(event)}
                  />
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-fit"
                  onClick={() => updateDraft("logoImageUrl", null)}
                >
                  <Upload className="size-4" aria-hidden="true" />
                  Clear logo
                </Button>
              </div>

              <div className="grid content-start gap-3 rounded-lg border bg-muted/25 p-4">
                <div className="flex items-center gap-3">
                  <LogoMark
                    brandLabel={draft.brandName || brandLabel}
                    imageUrl={draft.logoImageUrl}
                    className="size-16"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">
                      {draft.brandName.trim() || owner?.name || "Owner"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {owner?.email ?? "owner account"}
                    </p>
                  </div>
                </div>
                <div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
                  Main brand in the owner area. PickleBuddy stays secondary.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Interface presets</CardTitle>
              <CardDescription>
                Select a full owner workspace skin instead of designing from
                scratch.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {themePresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  selected={selectedPreset?.id === preset.id}
                  onSelect={() =>
                    setDraft((current) => ({ ...current, ...preset.values }))
                  }
                />
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Navigation layout</CardTitle>
              <CardDescription>
                Choose how owners move around the management workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {navigationLayoutOptions.map((option) => {
                const OptionIcon = option.icon
                const selected = draft.navigationLayout === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateDraft("navigationLayout", option.value)
                    }
                    className={cn(
                      "flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition hover:border-primary/50 hover:bg-muted/25",
                      selected &&
                        "border-primary bg-primary/5 ring-1 ring-primary/25"
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <OptionIcon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-medium">{option.label}</span>
                        {selected ? (
                          <Check
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Advanced controls</CardTitle>
              <CardDescription>
                Override the chosen preset while keeping the shell professional.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  { key: "primaryColor", label: "Action color" },
                  { key: "sidebarColor", label: "Navigation color" },
                  { key: "surfaceColor", label: "Workspace surface" },
                ].map((item) => (
                  <div key={item.key} className="grid gap-2">
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-2">
                      <input
                        id={item.key}
                        type="color"
                        value={
                          draft[item.key as keyof OwnerBrandingConfig] as string
                        }
                        onChange={(event) =>
                          updateDraft(
                            item.key as
                              "primaryColor" | "sidebarColor" | "surfaceColor",
                            event.target.value
                          )
                        }
                        className="size-11 rounded-md border-0 bg-transparent p-0"
                      />
                      <Input
                        value={
                          draft[item.key as keyof OwnerBrandingConfig] as string
                        }
                        onChange={(event) =>
                          updateDraft(
                            item.key as
                              "primaryColor" | "sidebarColor" | "surfaceColor",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Visual tone</Label>
                  <div className="grid gap-2">
                    {styleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateDraft("style", option.value)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
                          draft.style === option.value
                            ? "border-primary bg-primary/8"
                            : "hover:bg-muted/40"
                        )}
                      >
                        <span>
                          <span className="block text-sm font-medium">
                            {option.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                        {draft.style === option.value ? (
                          <Check
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Layout density</Label>
                  <div className="grid gap-2">
                    {densityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateDraft("density", option.value)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
                          draft.density === option.value
                            ? "border-primary bg-primary/8"
                            : "hover:bg-muted/40"
                        )}
                      >
                        <span>
                          <span className="block text-sm font-medium">
                            {option.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                        {draft.density === option.value ? (
                          <Check
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>
                Preview the branded workspace before saving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspacePreview draft={draft} ownerEmail={owner?.email} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
