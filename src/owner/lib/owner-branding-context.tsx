/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { persistStorageItem, readStorageItem } from "@/lib/auth-storage"
import {
  getOwnerBrandingWithApi,
  updateOwnerBrandingWithApi,
  type OwnerBrandingApiInput,
  type OwnerBrandingApiResponse,
} from "@/lib/owner-api"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"

export type OwnerBrandingDensity = "comfortable" | "compact"
export type OwnerBrandingStyle = "soft" | "vivid" | "executive"
export type OwnerDashboardPanel = "recent-transactions"
export type OwnerNavigationLayout = "sidebar" | "navbar"

export type OwnerBrandingConfig = {
  brandName: string
  logoImageUrl: string | null
  primaryColor: string
  sidebarColor: string
  surfaceColor: string
  density: OwnerBrandingDensity
  style: OwnerBrandingStyle
  navigationLayout: OwnerNavigationLayout
  dashboardPanels: OwnerDashboardPanel[]
}

type OwnerBrandingContextValue = {
  branding: OwnerBrandingConfig
  brandLabel: string
  setBranding: (
    nextValue:
      | OwnerBrandingConfig
      | ((current: OwnerBrandingConfig) => OwnerBrandingConfig)
  ) => void
  resetBranding: () => void
}

const DEFAULT_PRIMARY = "#65c466"
const DEFAULT_SIDEBAR = "#0f172a"
const DEFAULT_SURFACE = "#f8fafc"

const OwnerBrandingContext = React.createContext<
  OwnerBrandingContextValue | undefined
>(undefined)

function storageKeyForOwner(ownerId: string) {
  return `pb-owner-branding:${ownerId}`
}

function isHexColor(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
  )
}

function isDensity(value: unknown): value is OwnerBrandingDensity {
  return value === "comfortable" || value === "compact"
}

function isStyle(value: unknown): value is OwnerBrandingStyle {
  return value === "soft" || value === "vivid" || value === "executive"
}

function isNavigationLayout(value: unknown): value is OwnerNavigationLayout {
  return value === "sidebar" || value === "navbar"
}

function isDashboardPanel(value: unknown): value is OwnerDashboardPanel {
  return value === "recent-transactions"
}

function getDashboardPanels(value: unknown): OwnerDashboardPanel[] {
  if (Array.isArray(value)) {
    const panels = value.filter(isDashboardPanel)
    return panels.length > 0 ? [...new Set(panels)] : ["recent-transactions"]
  }

  if (isDashboardPanel(value)) {
    return [value]
  }

  return ["recent-transactions"]
}

function isOwnerBrandingConfig(value: unknown): value is OwnerBrandingConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as OwnerBrandingConfig).brandName === "string" &&
    ((value as OwnerBrandingConfig).logoImageUrl === null ||
      typeof (value as OwnerBrandingConfig).logoImageUrl === "string") &&
    isHexColor((value as OwnerBrandingConfig).primaryColor) &&
    isHexColor((value as OwnerBrandingConfig).sidebarColor) &&
    isHexColor((value as OwnerBrandingConfig).surfaceColor) &&
    isDensity((value as OwnerBrandingConfig).density) &&
    isStyle((value as OwnerBrandingConfig).style)
  )
}

function normalizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim()
  if (!isHexColor(trimmed)) {
    return fallback
  }

  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase()
  }

  return trimmed.toLowerCase()
}

function hexToRgb(hex: string) {
  const normalized = normalizeHexColor(hex, DEFAULT_PRIMARY).slice(1)
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function mixHexColors(base: string, target: string, weight: number) {
  const safeWeight = Math.max(0, Math.min(1, weight))
  const source = hexToRgb(base)
  const destination = hexToRgb(target)
  const next = {
    r: Math.round(source.r + (destination.r - source.r) * safeWeight),
    g: Math.round(source.g + (destination.g - source.g) * safeWeight),
    b: Math.round(source.b + (destination.b - source.b) * safeWeight),
  }

  return `#${[next.r, next.g, next.b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getReadableForeground(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000
  return luminance >= 160 ? "#0f172a" : "#f8fafc"
}

function createDefaultBranding(ownerName: string): OwnerBrandingConfig {
  return {
    brandName: ownerName,
    logoImageUrl: null,
    primaryColor: DEFAULT_PRIMARY,
    sidebarColor: DEFAULT_SIDEBAR,
    surfaceColor: DEFAULT_SURFACE,
    density: "comfortable",
    style: "soft",
    navigationLayout: "sidebar",
    dashboardPanels: ["recent-transactions"],
  }
}

function sanitizeBranding(
  candidate: OwnerBrandingConfig,
  ownerName: string
): OwnerBrandingConfig {
  const fallback = createDefaultBranding(ownerName)

  return {
    brandName: candidate.brandName.trim() || ownerName,
    logoImageUrl: candidate.logoImageUrl,
    primaryColor: normalizeHexColor(
      candidate.primaryColor,
      fallback.primaryColor
    ),
    sidebarColor: normalizeHexColor(
      candidate.sidebarColor,
      fallback.sidebarColor
    ),
    surfaceColor: normalizeHexColor(
      candidate.surfaceColor,
      fallback.surfaceColor
    ),
    density: candidate.density,
    style: candidate.style,
    navigationLayout: isNavigationLayout(
      (candidate as OwnerBrandingConfig & { navigationLayout?: unknown })
        .navigationLayout
    )
      ? (candidate as OwnerBrandingConfig & {
          navigationLayout: OwnerNavigationLayout
        }).navigationLayout
      : fallback.navigationLayout,
    dashboardPanels: getDashboardPanels(
      (candidate as OwnerBrandingConfig & { dashboardPanel?: unknown })
        .dashboardPanels ??
        (candidate as OwnerBrandingConfig & { dashboardPanel?: unknown })
          .dashboardPanel ??
        fallback.dashboardPanels
    ),
  }
}

export function mapOwnerBrandingApiToConfig(
  payload: OwnerBrandingApiResponse,
  ownerName = "Owner"
): OwnerBrandingConfig {
  return sanitizeBranding(
    {
      brandName: payload.brand_name,
      logoImageUrl: payload.logo_image_url,
      primaryColor: payload.primary_color,
      sidebarColor: payload.sidebar_color,
      surfaceColor: payload.surface_color,
      density: payload.density,
      style: payload.style,
      navigationLayout: payload.navigation_layout,
      dashboardPanels: payload.dashboard_panels,
    },
    ownerName
  )
}

function mapOwnerBrandingConfigToApi(
  config: OwnerBrandingConfig
): OwnerBrandingApiInput {
  return {
    brand_name: config.brandName,
    logo_image_url: config.logoImageUrl,
    primary_color: config.primaryColor,
    sidebar_color: config.sidebarColor,
    surface_color: config.surfaceColor,
    density: config.density,
    style: config.style,
    navigation_layout: config.navigationLayout,
    dashboard_panels: config.dashboardPanels,
  }
}

export function readStoredOwnerBranding(
  ownerId: string,
  ownerName = "Owner"
) {
  const fallback = createDefaultBranding(ownerName)
  const stored = readStorageItem(storageKeyForOwner(ownerId), isOwnerBrandingConfig)

  return stored ? sanitizeBranding(stored, ownerName) : fallback
}

export function buildOwnerBrandingStyle(
  branding: OwnerBrandingConfig
): React.CSSProperties {
  const primary = normalizeHexColor(branding.primaryColor, DEFAULT_PRIMARY)
  const sidebar = normalizeHexColor(branding.sidebarColor, DEFAULT_SIDEBAR)
  const surface = normalizeHexColor(branding.surfaceColor, DEFAULT_SURFACE)

  const background =
    branding.style === "executive"
      ? mixHexColors(surface, "#e2e8f0", 0.34)
      : branding.style === "vivid"
        ? mixHexColors(surface, primary, 0.1)
        : surface

  const card =
    branding.style === "executive"
      ? mixHexColors(surface, "#ffffff", 0.7)
      : mixHexColors(surface, "#ffffff", 0.86)

  const accent =
    branding.style === "vivid"
      ? mixHexColors(primary, "#ffffff", 0.84)
      : mixHexColors(surface, primary, 0.16)

  const muted = mixHexColors(
    surface,
    branding.style === "executive" ? "#cbd5e1" : "#ffffff",
    0.55
  )
  const border = mixHexColors(
    surface,
    "#cbd5e1",
    branding.style === "executive" ? 0.78 : 0.6
  )
  const sidebarAccent = mixHexColors(
    sidebar,
    "#ffffff",
    branding.style === "vivid" ? 0.16 : 0.1
  )
  const sidebarBorder = mixHexColors(sidebar, "#ffffff", 0.16)
  const foreground = getReadableForeground(background)
  const mutedForeground = mixHexColors(foreground, background, 0.42)

  return {
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": getReadableForeground(card),
    "--popover": card,
    "--popover-foreground": getReadableForeground(card),
    "--primary": primary,
    "--primary-foreground": getReadableForeground(primary),
    "--secondary": accent,
    "--secondary-foreground": getReadableForeground(accent),
    "--muted": muted,
    "--muted-foreground": mutedForeground,
    "--accent": accent,
    "--accent-foreground": getReadableForeground(accent),
    "--border": border,
    "--input": border,
    "--ring": rgba(primary, 0.34),
    "--sidebar": sidebar,
    "--sidebar-foreground": getReadableForeground(sidebar),
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": getReadableForeground(primary),
    "--sidebar-accent": sidebarAccent,
    "--sidebar-accent-foreground": getReadableForeground(sidebarAccent),
    "--sidebar-border": sidebarBorder,
    "--sidebar-ring": rgba(primary, 0.42),
    "--owner-shell-glow": rgba(
      primary,
      branding.style === "vivid" ? 0.24 : 0.14
    ),
    "--owner-shell-overlay": rgba(sidebar, 0.72),
  } as React.CSSProperties
}

export function OwnerBrandingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { owner } = useOwnerAuth()

  const [branding, setBrandingState] = React.useState<OwnerBrandingConfig>(() =>
    createDefaultBranding(owner?.name ?? "Owner")
  )

  React.useEffect(() => {
    if (!owner) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Branding state follows the active owner session.
      setBrandingState(createDefaultBranding("Owner"))
      return
    }

    let isActive = true
    const fallback = createDefaultBranding(owner.name)
    const stored = readStorageItem(
      storageKeyForOwner(owner.id),
      isOwnerBrandingConfig
    )

    const initialBranding = stored ? sanitizeBranding(stored, owner.name) : fallback
    setBrandingState(initialBranding)

    const ownerToken = owner.token
    if (ownerToken) {
      void getOwnerBrandingWithApi(ownerToken)
        .then((payload) => {
          if (!isActive) {
            return
          }

          if (!payload.is_customized && stored) {
            void updateOwnerBrandingWithApi(
              ownerToken,
              mapOwnerBrandingConfigToApi(initialBranding)
            ).catch(() => {
              // Keep the locally stored prototype branding if the API is unavailable.
            })
            return
          }

          const syncedBranding = mapOwnerBrandingApiToConfig(payload, owner.name)
          persistStorageItem(storageKeyForOwner(owner.id), syncedBranding)
          setBrandingState(syncedBranding)
        })
        .catch(() => {
          // Keep the locally stored prototype branding if the API is unavailable.
        })
    }

    return () => {
      isActive = false
    }
  }, [owner])

  const setBranding = React.useCallback<
    OwnerBrandingContextValue["setBranding"]
  >(
    (nextValue) => {
      if (!owner) {
        return
      }

      setBrandingState((current) => {
        const resolved =
          typeof nextValue === "function" ? nextValue(current) : nextValue
        const sanitized = sanitizeBranding(resolved, owner.name)

        persistStorageItem(storageKeyForOwner(owner.id), sanitized)
        if (owner.token) {
          void updateOwnerBrandingWithApi(
            owner.token,
            mapOwnerBrandingConfigToApi(sanitized)
          ).catch(() => {
            // Local branding remains usable even if the backend save fails.
          })
        }
        return sanitized
      })
    },
    [owner]
  )

  const resetBranding = React.useCallback(() => {
    if (!owner) {
      return
    }

    const fallback = createDefaultBranding(owner.name)
    persistStorageItem(storageKeyForOwner(owner.id), fallback)
    if (owner.token) {
      void updateOwnerBrandingWithApi(
        owner.token,
        mapOwnerBrandingConfigToApi(fallback)
      ).catch(() => {
        // Local branding remains usable even if the backend save fails.
      })
    }
    setBrandingState(fallback)
  }, [owner])

  const brandLabel = branding.brandName.trim() || owner?.name || "Owner"

  const value = React.useMemo(
    () => ({
      branding,
      brandLabel,
      setBranding,
      resetBranding,
    }),
    [branding, brandLabel, resetBranding, setBranding]
  )

  return (
    <OwnerBrandingContext.Provider value={value}>
      {children}
    </OwnerBrandingContext.Provider>
  )
}

export function useOwnerBranding() {
  const context = React.useContext(OwnerBrandingContext)

  if (context === undefined) {
    throw new Error(
      "useOwnerBranding must be used within an OwnerBrandingProvider"
    )
  }

  return context
}
