import { useMemo, useState } from "react"
import { CircleDollarSign, ReceiptText, RotateCcw, Search } from "lucide-react"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { TransactionDetailSheet } from "@/shared/components/transactions/transaction-detail-sheet"
import { TransactionTable } from "@/shared/components/transactions/transaction-table"
import type { Transaction, TransactionStatus } from "@/shared/lib/transactions-context"
import { cn } from "@/lib/utils"

const statusFilters: { value: TransactionStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

function transactionMatchesQuery(transaction: Transaction, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return (
    transaction.id.toLowerCase().includes(normalizedQuery) ||
    transaction.customerName.toLowerCase().includes(normalizedQuery) ||
    transaction.customerEmail.toLowerCase().includes(normalizedQuery) ||
    transaction.gym.toLowerCase().includes(normalizedQuery)
  )
}

export function TransactionsManager({
  transactions,
  searchPlaceholder = "Search by ID, customer, or gym",
  enableReporting = false,
  onSetStatus,
  onRefund,
}: {
  transactions: Transaction[]
  searchPlaceholder?: string
  enableReporting?: boolean
  onSetStatus: (id: string, status: TransactionStatus) => void
  onRefund: (id: string) => void
}) {
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  )
  const [gymFilter, setGymFilter] = useState("all")
  const [courtFilter, setCourtFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null)

  const paymentMethodOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(transactions.map((transaction) => transaction.paymentMethod))
      ).sort(),
    ],
    [transactions]
  )
  const gymOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(transactions.map((transaction) => transaction.gym))
      ).sort(),
    ],
    [transactions]
  )
  const courtOptions = useMemo(() => {
    const source =
      gymFilter === "all"
        ? transactions
        : transactions.filter((transaction) => transaction.gym === gymFilter)

    return [
      "all",
      ...Array.from(new Set(source.map((transaction) => transaction.court))).sort(),
    ]
  }, [transactions, gymFilter])

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          (statusFilter === "all" || transaction.status === statusFilter) &&
          (gymFilter === "all" || transaction.gym === gymFilter) &&
          (courtFilter === "all" || transaction.court === courtFilter) &&
          (paymentMethodFilter === "all" ||
            transaction.paymentMethod === paymentMethodFilter) &&
          (dateFrom.length === 0 || transaction.date >= dateFrom) &&
          (dateTo.length === 0 || transaction.date <= dateTo) &&
          transactionMatchesQuery(transaction, searchQuery)
      ),
    [
      transactions,
      statusFilter,
      gymFilter,
      courtFilter,
      paymentMethodFilter,
      dateFrom,
      dateTo,
      searchQuery,
    ]
  )

  const report = useMemo(() => {
    const revenue = filteredTransactions
      .filter((transaction) => transaction.paymentStatus === "paid")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const refunded = filteredTransactions
      .filter((transaction) => transaction.paymentStatus === "refunded")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return {
      totalReports: filteredTransactions.length,
      revenue,
      refunded,
    }
  }, [filteredTransactions])

  const selectedTransaction =
    transactions.find((transaction) => transaction.id === selectedTransactionId) ??
    null

  const hasActiveFilters =
    searchQuery.length > 0 ||
    statusFilter !== "all" ||
    gymFilter !== "all" ||
    courtFilter !== "all" ||
    paymentMethodFilter !== "all" ||
    dateFrom.length > 0 ||
    dateTo.length > 0

  function resetFilters() {
    setSearchQuery("")
    setStatusFilter("all")
    setGymFilter("all")
    setCourtFilter("all")
    setPaymentMethodFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  function handleStatusChange(id: string, status: TransactionStatus) {
    onSetStatus(id, status)
    toast.add({
      title: "Transaction updated",
      description: `${id} marked as ${status}.`,
      type: "success",
    })
  }

  function handleRefund(id: string) {
    onRefund(id)
    toast.add({
      title: "Payment refunded",
      description: `${id} has been refunded and cancelled.`,
      type: "success",
    })
  }

  return (
    <div className="grid gap-6">
      {enableReporting ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
            <div className="grid gap-1">
              <span className="text-xs uppercase text-muted-foreground">
                Total reports
              </span>
              <span className="text-xl font-semibold">{report.totalReports}</span>
            </div>
            <ReceiptText className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
            <div className="grid gap-1">
              <span className="text-xs uppercase text-muted-foreground">
                Revenue
              </span>
              <span className="text-xl font-semibold text-primary">
                ${report.revenue.toFixed(2)}
              </span>
            </div>
            <CircleDollarSign className="size-4 text-primary" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
            <div className="grid gap-1">
              <span className="text-xs uppercase text-muted-foreground">
                Refunded
              </span>
              <span className="text-xl font-semibold text-destructive">
                ${report.refunded.toFixed(2)}
              </span>
            </div>
            <ReceiptText className="size-4 text-destructive" aria-hidden="true" />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-lg border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
          <div className="relative min-w-0 md:col-span-2 xl:col-span-3">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="h-9 pl-8"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as TransactionStatus | "all")
            }
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 xl:col-span-1"
            aria-label="Filter by status"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <select
            value={paymentMethodFilter}
            onChange={(event) => setPaymentMethodFilter(event.target.value)}
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 xl:col-span-2"
            aria-label="Filter by payment method"
          >
            <option value="all">All payments</option>
            {paymentMethodOptions
              .filter((option) => option !== "all")
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>

          <select
            value={gymFilter}
            onChange={(event) => {
              setGymFilter(event.target.value)
              setCourtFilter("all")
            }}
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 xl:col-span-2"
            aria-label="Filter by gym"
          >
            <option value="all">All gyms</option>
            {gymOptions
              .filter((option) => option !== "all")
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>

          <select
            value={courtFilter}
            onChange={(event) => setCourtFilter(event.target.value)}
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 xl:col-span-2"
            aria-label="Filter by court"
          >
            <option value="all">All courts</option>
            {courtOptions
              .filter((option) => option !== "all")
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>

          <div className="min-w-0 rounded-md border bg-background p-1 md:col-span-2 xl:col-span-2">
            <DateRangePicker
              id="transactions-date-range"
              from={dateFrom}
              to={dateTo}
              onChange={({ from, to }) => {
                setDateFrom(from)
                setDateTo(to)
              }}
              placeholder="Date range"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-9 w-full md:w-auto xl:col-span-1",
              !hasActiveFilters && "opacity-60"
            )}
            onClick={resetFilters}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs uppercase text-muted-foreground">
              Quick status
            </Label>
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={statusFilter === filter.value ? "default" : "ghost"}
                className={cn(
                  "h-8 px-3",
                  statusFilter === filter.value && "pointer-events-none"
                )}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredTransactions.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {transactions.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <TransactionTable
          transactions={filteredTransactions}
          onView={(transaction) => setSelectedTransactionId(transaction.id)}
        />
      </div>

      <TransactionDetailSheet
        transaction={selectedTransaction}
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransactionId(null)
          }
        }}
        onConfirm={(id) => handleStatusChange(id, "confirmed")}
        onComplete={(id) => handleStatusChange(id, "completed")}
        onCancel={(id) => handleStatusChange(id, "cancelled")}
        onRefund={handleRefund}
      />
    </div>
  )
}
