import {
  CalendarDays,
  CircleAlert,
  Clock3,
  Image,
  Mail,
  MapPin,
  Receipt,
  User,
} from "lucide-react"

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
  const canApprove = transaction?.status === "pending" && !!transaction.paymentReceipt
  const canComplete = transaction?.status === "confirmed"

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
                  <User
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {transaction.customerName}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-4" aria-hidden="true" />
                  {transaction.customerEmail}
                </span>
              </div>

              <div className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
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

              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-800 dark:text-yellow-300">
                <div className="inline-flex items-start gap-2">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>
                    Review the payment method, reference number, sender name,
                    and uploaded receipt before approval. Approval is a manual
                    owner judgment call in this prototype.
                  </p>
                </div>
              </div>

              {transaction.paymentReceipt ? (
                <div className="grid gap-3 rounded-lg border bg-card p-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Receipt
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Payment proof
                  </span>
                  <div className="grid gap-1 rounded-lg bg-muted/30 p-3 text-muted-foreground">
                    <span>
                      Method:{" "}
                      <span className="font-medium text-foreground">
                        {transaction.paymentMethod}
                      </span>
                    </span>
                    <span>
                      Reference:{" "}
                      <span className="font-medium text-foreground">
                        {transaction.paymentReceipt.referenceNumber}
                      </span>
                    </span>
                    <span>
                      Sender:{" "}
                      <span className="font-medium text-foreground">
                        {transaction.paymentReceipt.accountName}
                      </span>
                    </span>
                  </div>
                  <a
                    href={transaction.paymentReceipt.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={transaction.paymentReceipt.imageUrl}
                      alt={`Payment proof for ${transaction.id}`}
                      className="max-h-72 w-full object-contain"
                    />
                  </a>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Image className="size-3.5" aria-hidden="true" />
                    {transaction.paymentReceipt.fileName}
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-800 dark:text-yellow-300">
                  No payment proof has been uploaded for this booking yet.
                </div>
              )}
            </div>

            <SheetFooter className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canApprove}
                onClick={() => onConfirm(transaction.id)}
              >
                Approve payment
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canComplete}
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
