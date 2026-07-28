import { CalendarDays, Clock3, Mail, MapPin, User } from "lucide-react"

import {
  PaymentStatusBadge,
  TransactionStatusBadge,
} from "@/shared/components/transactions/transaction-status-badge"
import type { Transaction } from "@/shared/lib/transactions-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  onConfirm,
  onComplete,
  onCancel,
  onRefund,
}: {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (id: string) => void
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  onRefund: (id: string) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {transaction ? (
          <>
            <SheetHeader>
              <SheetTitle>{transaction.id}</SheetTitle>
              <SheetDescription>
                Booking transaction details and status controls.
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
              <div className="flex items-center gap-2">
                <TransactionStatusBadge status={transaction.status} />
                <PaymentStatusBadge status={transaction.paymentStatus} />
              </div>

              <div className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <User className="size-4 text-muted-foreground" aria-hidden="true" />
                  {transaction.customerName}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-4" aria-hidden="true" />
                  {transaction.customerEmail}
                </span>
              </div>

              <div className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                  {transaction.gym}
                </span>
                <span className="text-muted-foreground">
                  Court: {transaction.court}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {transaction.date}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {transaction.slots.join(", ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">
                    Amount
                  </span>
                  <span className="mt-1 block text-lg font-semibold">
                    ${transaction.amount}
                  </span>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">
                    Payment method
                  </span>
                  <span className="mt-1 block font-medium">
                    {transaction.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            <SheetFooter className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={transaction.status === "confirmed"}
                onClick={() => onConfirm(transaction.id)}
              >
                Confirm
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={transaction.status === "completed"}
                onClick={() => onComplete(transaction.id)}
              >
                Mark completed
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={transaction.status === "cancelled"}
                onClick={() => onCancel(transaction.id)}
              >
                Cancel booking
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={transaction.paymentStatus === "refunded"}
                onClick={() => onRefund(transaction.id)}
              >
                Refund payment
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
