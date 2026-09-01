import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  BarChart3,
  CheckCircle2,
  ChartPie,
  Clock3,
  DollarSign,
  ListChecks,
  Receipt,
  XCircle,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getOwnerDashboardWithApi,
  type OwnerTransactionApiItem,
} from "@/lib/owner-api"
import { formatCurrency } from "@/lib/currency"
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
import { OwnerWorkspaceHero } from "@/owner/components/layout/owner-workspace-hero"
import { useOwnerBranding } from "@/owner/lib/owner-branding-context"
import { StatCard } from "@/shared/components/stat-card"
import { TransactionStatusBadge } from "@/shared/components/transactions/transaction-status-badge"

type DashboardState = {
  revenue: number
  pending: number
  completed: number
  cancelled: number
  recentTransactions: OwnerTransactionApiItem[]
}

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
  const [error, setError] = useState<string | null>(null)

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

  const revenueChart = useMemo(() => {
    const rows = dashboard.recentTransactions
      .slice(0, 6)
      .reverse()
      .map((transaction, index) => ({
        label: `T${index + 1}`,
        amount: transaction.payment_status === "paid" ? transaction.amount : 0,
      }))
    const maxAmount = Math.max(...rows.map((row) => row.amount), 1)

    return { rows, maxAmount }
  }, [dashboard.recentTransactions])

  const bookingMix = useMemo(
    () => [
      {
        label: "Pending review",
        value: dashboard.pending,
        icon: Clock3,
        tone: "text-amber-600",
      },
      {
        label: "Completed",
        value: dashboard.completed,
        icon: CheckCircle2,
        tone: "text-primary",
      },
      {
        label: "Cancelled",
        value: dashboard.cancelled,
        icon: XCircle,
        tone: "text-destructive",
      },
    ],
    [dashboard.cancelled, dashboard.completed, dashboard.pending]
  )

  const showRecentTransactions = branding.dashboardPanels.includes(
    "recent-transactions"
  )
  const showRevenueChart = branding.dashboardPanels.includes("revenue-chart")
  const showBookingMix = branding.dashboardPanels.includes("booking-mix")

  return (
    <div className="grid gap-6">
      <OwnerWorkspaceHero
        eyebrow="Overview"
        title="Venue overview"
        description="A snapshot of bookings, payment activity, and venue performance across your owner workspace."
        meta="Dashboard"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(dashboard.revenue)}
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Pending"
          value={String(dashboard.pending)}
          icon={Clock3}
          tone="warning"
        />
        <StatCard
          label="Completed"
          value={String(dashboard.completed)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Cancelled"
          value={String(dashboard.cancelled)}
          icon={XCircle}
          tone="destructive"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {showRecentTransactions ? (
          <Card className="rounded-lg xl:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  Recent transactions
                </CardTitle>
                <CardDescription>
                  The latest bookings placed at your venues.
                </CardDescription>
              </div>
              <Link
                to="/owner/transactions"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Receipt className="size-4" aria-hidden="true" />
                View all
              </Link>
            </CardHeader>
            <CardContent className="grid gap-3">
              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </p>
              ) : dashboard.recentTransactions.length === 0 ? (
                <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  No transactions yet for your venues.
                </p>
              ) : (
                dashboard.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.public_id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
                  >
                    <div>
                      <p className="font-medium">{transaction.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.venue_name} /{" "}
                        {transaction.court_name ?? "Whole gym"} /{" "}
                        {transaction.booking_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </span>
                      <TransactionStatusBadge status={transaction.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        {showRevenueChart ? (
          <Card className="rounded-lg">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  Revenue graph
                </CardTitle>
                <CardDescription>
                  Paid booking revenue from recent transactions.
                </CardDescription>
              </div>
              <Link
                to="/owner/transactions"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Receipt className="size-4" aria-hidden="true" />
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </p>
              ) : revenueChart.rows.length === 0 ? (
                <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  No revenue data yet.
                </p>
              ) : (
                <div className="grid gap-4">
                  <div className="flex h-56 items-end gap-3 rounded-lg border bg-muted/20 p-4">
                    {revenueChart.rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex h-full flex-1 flex-col justify-end gap-2"
                      >
                        <span className="text-center text-xs font-medium">
                          {formatCurrency(row.amount)}
                        </span>
                        <span
                          className="min-h-2 rounded-t-md bg-primary"
                          style={{
                            height: `${Math.max((row.amount / revenueChart.maxAmount) * 100, 4)}%`,
                          }}
                        />
                        <span className="text-center text-xs text-muted-foreground">
                          {row.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This chart uses the most recent paid transactions available
                    on the owner dashboard.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {showBookingMix ? (
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartPie className="size-5 text-primary" aria-hidden="true" />
                Booking mix
              </CardTitle>
              <CardDescription>
                Status breakdown for the bookings in your venues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {bookingMix.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border bg-muted/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <item.icon
                        className={`size-5 ${item.tone}`}
                        aria-hidden="true"
                      />
                      <span className="text-2xl font-semibold">
                        {item.value}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
