import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, Clock3, DollarSign, Receipt, XCircle } from "lucide-react"

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
import { useOwnerAuth } from "@/owner/lib/owner-auth-context"
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

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Overview</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {owner?.name}'s venues
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A snapshot of bookings and payments across your gyms.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={`$${dashboard.revenue.toFixed(2)}`}
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

      <Card className="rounded-lg">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent transactions</CardTitle>
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
                    {transaction.venue_name} ·{" "}
                    {transaction.court_name ?? "Whole gym"} ·{" "}
                    {transaction.booking_date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${transaction.amount}</span>
                  <TransactionStatusBadge status={transaction.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
