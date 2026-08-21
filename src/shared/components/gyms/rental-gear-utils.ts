import type {
  RentalGearCategory,
  RentalItemStatus,
} from "@/shared/lib/gyms-context"

export type RentalItemDraft = {
  id: string
  name: string
  category: RentalGearCategory
  pricePerSession: string
  quantityAvailable: string
  status: RentalItemStatus
  description: string
}

export function createRentalItemDraft(): RentalItemDraft {
  return {
    // Empty until saved; a real id is assigned when the draft is normalized.
    id: "",
    name: "",
    category: "paddle",
    pricePerSession: "",
    quantityAvailable: "1",
    status: "available",
    description: "",
  }
}

export function rentalDraftIsComplete(draft: RentalItemDraft) {
  const price = Number(draft.pricePerSession)
  const quantity = Number(draft.quantityAvailable)

  return Boolean(
    draft.name.trim() &&
      Number.isFinite(price) &&
      price > 0 &&
      Number.isFinite(quantity) &&
      quantity > 0
  )
}

export function rentalDraftIsEmpty(draft: RentalItemDraft) {
  return !(
    draft.name.trim() ||
    draft.pricePerSession.trim() ||
    draft.description.trim()
  )
}
