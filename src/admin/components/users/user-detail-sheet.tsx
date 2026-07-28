import { CalendarDays, Mail, Phone, UserRound } from "lucide-react"

import { TransactionStatusBadge } from "@/shared/components/transactions/transaction-status-badge"
import type { Transaction } from "@/shared/lib/transactions-context"
import { UserStatusBadge } from "@/admin/components/users/user-status-badge"
import type { Player } from "@/admin/lib/admin-users-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function UserDetailSheet({
  player,
  transactions,
  open,
  onOpenChange,
  onToggleStatus,
}: {
  player: Player | null
  transactions: Transaction[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleStatus: (id: string) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {player ? (
          <>
            <SheetHeader>
              <SheetTitle>{player.name}</SheetTitle>
              <SheetDescription>Player profile and booking history.</SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 px-4">
              <div>
                <UserStatusBadge status={player.status} />
              </div>

              <div className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                  {player.name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-4" aria-hidden="true" />
                  {player.email}
                </span>
                {player.phone ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="size-4" aria-hidden="true" />
                    {player.phone}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Joined {player.joinedAt}
                </span>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Booking history ({transactions.length})
                </p>
                {transactions.length === 0 ? (
                  <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                    No bookings yet.
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
                            {transaction.gym} · {transaction.court}
                          </p>
                          <p className="text-muted-foreground">
                            {transaction.date} · ${transaction.amount}
                          </p>
                        </div>
                        <TransactionStatusBadge status={transaction.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <SheetFooter>
              <Button
                type="button"
                variant={player.status === "active" ? "destructive" : "outline"}
                onClick={() => onToggleStatus(player.id)}
              >
                {player.status === "active"
                  ? "Suspend player"
                  : "Reactivate player"}
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
