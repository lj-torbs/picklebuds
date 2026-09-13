import { useEffect, useMemo, useState } from "react"
import { CircleDollarSign, ReceiptText, RotateCcw, Search } from "lucide-react"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/currency"
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

type AdvanceBookingFilter = "all" | "week" | "month"
type SystemFeeFilter = "all" | "billable" | "not_billable"

const advanceBookingFilters: {
  value: AdvanceBookingFilter
  label: string
}[] = [
  { value: "all", label: "All booking dates" },
  { value: "week", label: "7+ days advance" },
  { value: "month", label: "30+ days advance" },
]

const systemFeeFilters: {
  value: SystemFeeFilter
  label: string
}[] = [
  { value: "all", label: "All fees" },
  { value: "billable", label: "Billable fee" },
  { value: "not_billable", label: "Not billable" },
]

const pageSizeOptions = [5, 10, 20, 50]

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getAdvanceBookingDays(dateValue: string) {
  const bookingDate = parseDateValue(dateValue)

  if (!bookingDate) {
    return 0
  }

  const today = startOfLocalDay(new Date())
  const bookingDay = startOfLocalDay(bookingDate)
  return Math.round(
    (bookingDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
}

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

function transactionHasSystemFee(transaction: Transaction) {
  return transaction.paymentStatus === "paid" && transaction.status !== "cancelled"
}

export function TransactionsManager({
  transactions,
  searchPlaceholder = "Search by ID, customer, or gym",
  enableReporting = false,
  systemFeePerTransaction = 10,
  allowHorizontalTableScroll = true,
  onSetStatus,
  onRefund,
  highlightedTransactionId,
}: {
  transactions: Transaction[]
  searchPlaceholder?: string
  enableReporting?: boolean
  systemFeePerTransaction?: number
  allowHorizontalTableScroll?: boolean
  onSetStatus: (id: string, status: TransactionStatus) => void | Promise<void>
  onRefund: (id: string) => void | Promise<void>
  highlightedTransactionId?: string | null
}) {
  const toast = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  )
  const [gymFilter, setGymFilter] = useState("all")
  const [courtFilter, setCourtFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [advanceBookingFilter, setAdvanceBookingFilter] =
    useState<AdvanceBookingFilter>("all")
  const [systemFeeFilter, setSystemFeeFilter] =
    useState<SystemFeeFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null)
  const [submittingTransactionId, setSubmittingTransactionId] = useState<
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
          (advanceBookingFilter === "all" ||
            (advanceBookingFilter === "week" &&
              getAdvanceBookingDays(transaction.date) >= 7) ||
            (advanceBookingFilter === "month" &&
              getAdvanceBookingDays(transaction.date) >= 30)) &&
          (systemFeeFilter === "all" ||
            (systemFeeFilter === "billable" &&
              transactionHasSystemFee(transaction)) ||
            (systemFeeFilter === "not_billable" &&
              !transactionHasSystemFee(transaction))) &&
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
      advanceBookingFilter,
      systemFeeFilter,
      dateFrom,
      dateTo,
      searchQuery,
    ]
  )

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
  )
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredTransactions.slice(startIndex, startIndex + pageSize)
  }, [currentPage, filteredTransactions, pageSize])
  const paginationStart =
    filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const paginationEnd = Math.min(
    currentPage * pageSize,
    filteredTransactions.length
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchQuery,
    statusFilter,
    gymFilter,
    courtFilter,
    paymentMethodFilter,
    advanceBookingFilter,
    systemFeeFilter,
    dateFrom,
    dateTo,
    pageSize,
  ])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const report = useMemo(() => {
    const revenue = filteredTransactions
      .filter((transaction) => transaction.paymentStatus === "paid")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const refunded = filteredTransactions
      .filter((transaction) => transaction.paymentStatus === "refunded")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const systemFeeBillableCount = filteredTransactions.filter(
      transactionHasSystemFee
    ).length

    return {
      totalReports: filteredTransactions.length,
      revenue,
      refunded,
      systemFeeBillableCount,
      systemFeeOwed: systemFeeBillableCount * systemFeePerTransaction,
    }
  }, [filteredTransactions, systemFeePerTransaction])

  const selectedTransaction =
    transactions.find((transaction) => transaction.id === selectedTransactionId) ??
    null

  const hasActiveFilters =
    searchQuery.length > 0 ||
    statusFilter !== "all" ||
    gymFilter !== "all" ||
    courtFilter !== "all" ||
    paymentMethodFilter !== "all" ||
    advanceBookingFilter !== "all" ||
    systemFeeFilter !== "all" ||
    dateFrom.length > 0 ||
    dateTo.length > 0

  function resetFilters() {
    setSearchQuery("")
    setStatusFilter("all")
    setGymFilter("all")
    setCourtFilter("all")
    setPaymentMethodFilter("all")
    setAdvanceBookingFilter("all")
    setSystemFeeFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  async function handleStatusChange(id: string, status: TransactionStatus) {
    setSubmittingTransactionId(id)
    try {
      await onSetStatus(id, status)
      toast.add({
        title: "Transaction updated",
        description: `${id} marked as ${status}.`,
        type: "success",
      })
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to update the transaction right now."
      toast.add({
        title: "Update failed",
        description,
        type: "error",
      })
    } finally {
      setSubmittingTransactionId(null)
    }
  }

  async function handleRefund(id: string) {
    setSubmittingTransactionId(id)
    try {
      await onRefund(id)
      toast.add({
        title: "Payment refunded",
        description: `${id} has been refunded and cancelled.`,
        type: "success",
      })
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to refund the transaction right now."
      toast.add({
        title: "Refund failed",
        description,
        type: "error",
      })
    } finally {
      setSubmittingTransactionId(null)
    }
  }

  return (
    <div className="grid min-w-0 gap-6">
      {enableReporting ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                {formatCurrency(report.revenue)}
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
                {formatCurrency(report.refunded)}
              </span>
            </div>
            <ReceiptText className="size-4 text-destructive" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="grid gap-1">
              <span className="text-xs uppercase text-muted-foreground">
                System fee owed
              </span>
              <span className="text-xl font-semibold text-amber-700">
                {formatCurrency(report.systemFeeOwed)}
              </span>
              <span className="text-xs text-muted-foreground">
                {report.systemFeeBillableCount} x{" "}
                {formatCurrency(systemFeePerTransaction)}
              </span>
            </div>
            <ReceiptText className="size-4 text-amber-700" aria-hidden="true" />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-lg border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1.3fr)_minmax(96px,0.65fr)_minmax(132px,0.85fr)_minmax(132px,0.85fr)_minmax(132px,0.85fr)_minmax(142px,0.9fr)_minmax(132px,0.85fr)_minmax(176px,1fr)_auto]">
          <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
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
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

          <select
            value={advanceBookingFilter}
            onChange={(event) =>
              setAdvanceBookingFilter(
                event.target.value as AdvanceBookingFilter
              )
            }
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Filter by advance booking"
          >
            {advanceBookingFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <select
            value={systemFeeFilter}
            onChange={(event) =>
              setSystemFeeFilter(event.target.value as SystemFeeFilter)
            }
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Filter by system fee"
          >
            {systemFeeFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <div className="min-w-0 rounded-md border bg-background p-1 md:col-span-2 xl:col-span-1">
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
              "h-9 w-full md:w-auto",
              !hasActiveFilters && "opacity-60"
            )}
            onClick={resetFilters}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
        </div>

      </div>

      <div className="grid min-w-0 gap-2">
          <TransactionTable
            transactions={paginatedTransactions}
            highlightedTransactionId={highlightedTransactionId}
            allowHorizontalScroll={allowHorizontalTableScroll}
            onView={(transaction) => setSelectedTransactionId(transaction.id)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {paginationStart}
                </span>
                -
                <span className="font-medium text-foreground">
                  {paginationEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredTransactions.length}
                </span>
              </span>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}/page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <span className="min-w-20 text-center text-sm text-muted-foreground">
                Page{" "}
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalPages}
                </span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
      </div>

      <TransactionDetailSheet
        transaction={selectedTransaction}
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransactionId(null)
          }
        }}
        isSubmitting={submittingTransactionId === selectedTransactionId}
        onConfirm={(id) => handleStatusChange(id, "confirmed")}
        onComplete={(id) => handleStatusChange(id, "completed")}
        onCancel={(id) => handleStatusChange(id, "cancelled")}
        onRefund={handleRefund}
      />
    </div>
  )
}
