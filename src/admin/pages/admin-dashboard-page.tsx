import { useMemo } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, Clock3, DollarSign, Receipt, XCircle } from "lucide-react"

import { TransactionStatusBadge } from "@/shared/components/transactions/transaction-status-badge"
import { StatCard } from "@/shared/components/stat-card"
import { useTransactions } from "@/shared/lib/transactions-context"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AdminDashboardPage() {
  const { transactions } = useTransactions()

  const stats = useMemo(() => {
    const revenue = transactions
      .filter((transaction) => transaction.paymentStatus === "paid")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const pending = transactions.filter(
      (transaction) => transaction.status === "pending"
    ).length
    const completed = transactions.filter(
      (transaction) => transaction.status === "completed"
    ).length
    const cancelled = transactions.filter(
      (transaction) => transaction.status === "cancelled"
    ).length

    return { revenue, pending, completed, cancelled }
  }, [transactions])

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [transactions]
  )

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">Overview</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Transaction activity
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A snapshot of bookings and payments across all gyms and courts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={`$${stats.revenue}`}
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Pending"
          value={String(stats.pending)}
          icon={Clock3}
          tone="warning"
        />
        <StatCard
          label="Completed"
          value={String(stats.completed)}
          icon={CheckCircle2}
        />
        <StatCard
          label="Cancelled"
          value={String(stats.cancelled)}
          icon={XCircle}
          tone="destructive"
        />
      </div>

      <Card className="rounded-lg">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              The latest bookings placed across the platform.
            </CardDescription>
          </div>
          <Link
            to="/admin/transactions"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Receipt className="size-4" aria-hidden="true" />
            View all
          </Link>
        </CardHeader>
        <CardContent className="grid gap-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
            >
              <div>
                <p className="font-medium">{transaction.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.gym} · {transaction.court} · {transaction.date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">${transaction.amount}</span>
                <TransactionStatusBadge status={transaction.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
