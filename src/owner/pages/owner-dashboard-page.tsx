import { useEffect, useMemo, useState } from "react"
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  DollarSign,
  ListChecks,
  XCircle,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import {
  getOwnerDashboardWithApi,
  type OwnerTransactionApiItem,
} from "@/lib/owner-api"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { useOwnerBranding } from "@/owner/lib/owner-branding-context"
import { TransactionStatusBadge } from "@/shared/components/transactions/transaction-status-badge"

type DashboardState = {
  revenue: number
  pending: number
  completed: number
  cancelled: number
  recentTransactions: OwnerTransactionApiItem[]
}

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("en-PH", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
})

export function OwnerDashboardPage() {
  const { owner } = useOwnerAuth()
  const { branding } = useOwnerBranding()
  const [dashboard, setDashboard] = useState<DashboardState>({
    revenue: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    recentTransactions: [],
  })
  const [now, setNow] = useState(() => new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!owner?.token) {
      return
    }

    let isActive = true

    void getOwnerDashboardWithApi(owner.token)
      .then((response) => {
        if (!isActive) {
          return
        }

        setDashboard({
          revenue: response.stats.total_revenue,
          pending: response.stats.pending_count,
          completed: response.stats.completed_count,
          cancelled: response.stats.cancelled_count,
          recentTransactions: response.recent_transactions,
        })
        setError(null)
      })
      .catch((nextError) => {
        if (!isActive) {
          return
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load dashboard."
        )
      })

    return () => {
      isActive = false
    }
  }, [owner?.token])

  const metrics = useMemo(
    () => [
      {
        label: "Revenue",
        value: formatCurrency(dashboard.revenue),
        helper: "Approved payments",
        icon: DollarSign,
        shell:
          "border-primary/15 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_42%),linear-gradient(135deg,hsl(var(--primary)/0.06),hsl(var(--card))_64%)]",
        iconTone: "bg-primary/10 text-primary",
        valueTone: "text-primary",
      },
      {
        label: "For review",
        value: String(dashboard.pending),
        helper: "Pending proofs",
        icon: Clock3,
        shell:
          "border-amber-500/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_42%),linear-gradient(135deg,rgba(245,158,11,0.07),hsl(var(--card))_64%)]",
        iconTone: "bg-amber-500/10 text-amber-700",
        valueTone: "text-amber-700",
      },
      {
        label: "Completed",
        value: String(dashboard.completed),
        helper: "Confirmed bookings",
        icon: CheckCircle2,
        shell:
          "border-emerald-500/20 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_42%),linear-gradient(135deg,rgba(16,185,129,0.07),hsl(var(--card))_64%)]",
        iconTone: "bg-emerald-500/10 text-emerald-700",
        valueTone: "text-emerald-700",
      },
      {
        label: "Cancelled",
        value: String(dashboard.cancelled),
        helper: "Voided bookings",
        icon: XCircle,
        shell:
          "border-destructive/20 bg-[radial-gradient(circle_at_top_right,hsl(var(--destructive)/0.13),transparent_42%),linear-gradient(135deg,hsl(var(--destructive)/0.06),hsl(var(--card))_64%)]",
        iconTone: "bg-destructive/10 text-destructive",
        valueTone: "text-destructive",
      },
    ],
    [
      dashboard.cancelled,
      dashboard.completed,
      dashboard.pending,
      dashboard.revenue,
    ]
  )

  const showRecentTransactions = branding.dashboardPanels.includes(
    "recent-transactions"
  )

  return (
    <div className="grid gap-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Dashboard
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm shadow-xs">
          <CalendarClock className="size-4 text-primary" aria-hidden="true" />
          <span className="text-muted-foreground">
            {dateFormatter.format(now)}
          </span>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <span className="font-medium tabular-nums">
            {timeFormatter.format(now)}
          </span>
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className={cn("overflow-hidden rounded-lg shadow-xs", metric.shell)}
          >
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </span>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    metric.iconTone
                  )}
                >
                  <metric.icon className="size-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p
                  className={cn(
                    "truncate text-xl font-semibold tracking-tight",
                    metric.valueTone
                  )}
                >
                  {metric.value}
                </p>
                <p className="shrink-0 pb-1 text-xs text-muted-foreground">
                  {metric.helper}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {showRecentTransactions ? (
        <Card className="rounded-lg">
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="size-4 text-primary" />
                  Recent transactions
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Latest bookings from your venues.
                </p>
              </div>
            </div>

            {dashboard.recentTransactions.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">
                        Customer
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Venue
                      </th>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentTransactions
                      .slice(0, 6)
                      .map((transaction) => (
                        <tr key={transaction.public_id} className="border-t">
                          <td className="px-4 py-3 font-medium">
                            {transaction.customer_name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {transaction.venue_name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {transaction.booking_date}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <TransactionStatusBadge
                              status={transaction.status}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
