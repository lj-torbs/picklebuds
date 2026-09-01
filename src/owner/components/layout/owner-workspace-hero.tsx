import { Building2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useOwnerBranding } from "@/owner/lib/owner-branding-context"

export function OwnerWorkspaceHero({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  meta?: string
  actions?: React.ReactNode
}) {
  const { branding, brandLabel } = useOwnerBranding()

  return (
    <section
      className="relative overflow-hidden rounded-lg border bg-card"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, var(--card)) 0%, var(--card) 58%, color-mix(in srgb, var(--sidebar) 7%, var(--background)) 100%)",
      }}
    >
      <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background/85 shadow-sm">
              {branding.logoImageUrl ? (
                <img
                  src={branding.logoImageUrl}
                  alt={`${brandLabel} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="size-5 text-primary" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary uppercase">
                {eyebrow}
              </p>
              {meta ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {meta}
                </p>
              ) : null}
            </div>
          </div>

          <h2 className="max-w-3xl text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {actions ? (
          <div
            className={cn(
              "flex flex-wrap gap-2 lg:justify-end",
              branding.density === "compact" && "gap-1.5"
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  )
}
