import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: "default" | "primary" | "warning" | "destructive"
}) {
  const toneStyles: Record<typeof tone, string> = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
    warning: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            toneStyles[tone]
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
