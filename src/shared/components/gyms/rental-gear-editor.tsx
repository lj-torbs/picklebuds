import { Package, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type {
  RentalGearCategory,
  RentalItemStatus,
} from "@/shared/lib/gyms-context"
import { rentalGearCategoryLabels } from "@/shared/lib/gyms-context"
import type { RentalItemDraft } from "@/shared/components/gyms/rental-gear-utils"
import {
  createRentalItemDraft,
  rentalDraftIsComplete,
  rentalDraftIsEmpty,
} from "@/shared/components/gyms/rental-gear-utils"

const categoryOptions = Object.keys(
  rentalGearCategoryLabels
) as RentalGearCategory[]

export function RentalGearEditor({
  items,
  onChange,
}: {
  items: RentalItemDraft[]
  onChange: (items: RentalItemDraft[]) => void
}) {
  function updateItem(index: number, update: Partial<RentalItemDraft>) {
    onChange(
      items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...update } : item
      )
    )
  }

  function removeItem(index: number) {
    onChange(items.filter((_, currentIndex) => currentIndex !== index))
  }

  return (
    <div className="grid min-w-0 gap-4">
      {items.length === 0 ? (
        <div className="grid justify-items-center gap-2 rounded-lg border border-dashed p-6 text-center">
          <Package className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="w-full text-sm font-medium">No gear listed yet</p>
          <p className="w-full max-w-md text-xs text-muted-foreground">
            Add paddles, balls, or other equipment players can rent when they
            book a court here. Leave this empty if you don't rent gear.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid min-w-0 content-start gap-3 rounded-lg border bg-background p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium">
                  {item.name.trim() || `Item ${index + 1}`}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Remove
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`gear-name-${index}`}>Item name</Label>
                <Input
                  id={`gear-name-${index}`}
                  value={item.name}
                  onChange={(event) =>
                    updateItem(index, { name: event.target.value })
                  }
                  placeholder="e.g. Recreational paddle"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`gear-category-${index}`}>Category</Label>
                <select
                  id={`gear-category-${index}`}
                  value={item.category}
                  onChange={(event) =>
                    updateItem(index, {
                      category: event.target.value as RentalGearCategory,
                    })
                  }
                  className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {rentalGearCategoryLabels[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                <div className="grid gap-2">
                  <Label htmlFor={`gear-price-${index}`}>Price per session</Label>
                  <Input
                    id={`gear-price-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    value={item.pricePerSession}
                    onChange={(event) =>
                      updateItem(index, { pricePerSession: event.target.value })
                    }
                    placeholder="e.g. 3"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`gear-quantity-${index}`}>Units in stock</Label>
                  <Input
                    id={`gear-quantity-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantityAvailable}
                    onChange={(event) =>
                      updateItem(index, {
                        quantityAvailable: event.target.value,
                      })
                    }
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Availability</Label>
                <div className="flex gap-2">
                  {(["available", "unavailable"] as RentalItemStatus[]).map(
                    (status) => (
                      <Button
                        key={status}
                        type="button"
                        size="sm"
                        variant={item.status === status ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => updateItem(index, { status })}
                      >
                        {status}
                      </Button>
                    )
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`gear-description-${index}`}>
                  Description
                </Label>
                <textarea
                  id={`gear-description-${index}`}
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, { description: event.target.value })
                  }
                  placeholder="Optional note players see when picking gear."
                  className="min-h-20 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              {!rentalDraftIsComplete(item) && !rentalDraftIsEmpty(item) ? (
                <p
                  className={cn(
                    "rounded-md border border-destructive/30 bg-destructive/5 p-2",
                    "text-xs text-destructive"
                  )}
                >
                  Needs a name, a price above 0, and at least 1 unit in stock to
                  be saved.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => onChange([...items, createRentalItemDraft()])}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add gear item
      </Button>
    </div>
  )
}
