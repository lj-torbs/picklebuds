import { CalendarDays, Mail, Phone, ShieldAlert, UserRound } from "lucide-react"

import { OwnerStatusBadge } from "@/admin/components/owners/owner-status-badge"
import type {
  OwnerRecord,
  SystemPaymentStatus,
} from "@/admin/lib/admin-owners-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { TransactionStatusBadge } from "@/shared/components/transactions/transaction-status-badge"
import type { Transaction } from "@/shared/lib/transactions-context"

function PaymentStatusBadge({
  status,
}: {
  status: SystemPaymentStatus
}) {
  return (
    <span
      className={
        status === "paid"
          ? "rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary"
          : "rounded-md bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-700"
      }
    >
      {status === "paid" ? "Paid to system" : "Unpaid to system"}
    </span>
  )
}

export function OwnerDetailSheet({
  owner,
  transactions,
  open,
  onOpenChange,
  onToggleStatus,
  onSetSystemPaymentStatus,
  onLockUntilPaid,
  settlementSummary,
}: {
  owner: OwnerRecord | null
  transactions: Transaction[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleStatus: (id: string) => void
  onSetSystemPaymentStatus: (id: string, status: SystemPaymentStatus) => void
  onLockUntilPaid: (id: string) => void
  settlementSummary: {
    totalGyms: number
    totalCourts: number
    grossRevenue: number
    systemShare: number
    ownerProfit: number
  } | null
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {owner ? (
          <>
            <SheetHeader>
              <SheetTitle>{owner.name}</SheetTitle>
              <SheetDescription>
                Owner profile, settlement summary, and venue transaction history.
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
              <div className="flex flex-wrap items-center gap-2">
                <OwnerStatusBadge status={owner.status} />
                <PaymentStatusBadge status={owner.systemPaymentStatus} />
              </div>

              {owner.suspensionReason === "system_payment_due" ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>You need to pay the system share first before access is restored.</span>
                </div>
              ) : null}

              <div className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                  {owner.name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-4" aria-hidden="true" />
                  {owner.email}
                </span>
                {owner.phone ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="size-4" aria-hidden="true" />
                    {owner.phone}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Joined {owner.joinedAt}
                </span>
              </div>

              {settlementSummary ? (
                <div className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Gyms
                      </p>
                      <p className="text-lg font-semibold">{settlementSummary.totalGyms}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Courts
                      </p>
                      <p className="text-lg font-semibold">{settlementSummary.totalCourts}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Owner total profit
                      </p>
                      <p className="font-semibold">${settlementSummary.ownerProfit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        System share
                      </p>
                      <p className="font-semibold">${settlementSummary.systemShare.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Venue transactions ({transactions.length})
                </p>
                {transactions.length === 0 ? (
                  <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                    No venue transactions yet.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {transaction.gym} - {transaction.court}
                          </p>
                          <p className="text-muted-foreground">
                            {transaction.date} - ${transaction.amount}
                          </p>
                        </div>
                        <TransactionStatusBadge status={transaction.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <div className="flex w-full flex-wrap gap-2">
                {owner.systemPaymentStatus === "unpaid" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSetSystemPaymentStatus(owner.id, "paid")}
                  >
                    Mark system share paid
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSetSystemPaymentStatus(owner.id, "unpaid")}
                  >
                    Mark system share unpaid
                  </Button>
                )}

                {owner.systemPaymentStatus === "unpaid" &&
                owner.status === "active" ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onLockUntilPaid(owner.id)}
                  >
                    Lock until paid
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant={owner.status === "active" ? "destructive" : "outline"}
                  onClick={() => onToggleStatus(owner.id)}
                >
                  {owner.status === "active"
                    ? "Suspend owner"
                    : "Reactivate owner"}
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
