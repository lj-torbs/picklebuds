import type { Gym } from "@/shared/lib/gyms-context"
import type { OwnerVenueApiResponse } from "@/lib/owner-api"
import { mapOwnerBrandingApiToConfig } from "@/owner/lib/owner-branding-context"

export function mapOwnerVenueToGym(venue: OwnerVenueApiResponse): Gym {
  return {
    id: venue.public_id,
    ownerId: venue.owner_public_id,
    ownerBranding: venue.owner_branding
      ? mapOwnerBrandingApiToConfig(venue.owner_branding, venue.name)
      : undefined,
    name: venue.name,
    address: venue.address,
    phone: venue.phone ?? "",
    status: venue.status,
    imageUrl: venue.image_url ?? undefined,
    paymentOptions: venue.payment_methods.map((method) => ({
      provider: method.provider,
      accountName: method.account_name,
      accountNumber: method.account_number,
      instructions: method.instructions ?? undefined,
      qrCodeImageUrl: method.qr_code_image_url,
      qrCodeFileName: method.qr_code_file_name,
    })),
    wholeGymBooking:
      venue.whole_gym_booking && venue.whole_gym_booking.enabled
        ? {
            enabled: true,
            pricePerHour: venue.whole_gym_booking.price_per_hour ?? 0,
            availableSlots: venue.whole_gym_booking.available_slots,
            notes: venue.whole_gym_booking.notes ?? undefined,
          }
        : undefined,
    rentalItems: venue.rental_items.map((item) => ({
      id: item.public_id,
      name: item.name,
      category: item.category,
      pricePerSession: item.price_per_session,
      quantityAvailable: item.quantity_available,
      status: item.status,
      description: item.description ?? undefined,
    })),
    courts: venue.courts.map((court) => ({
      id: court.public_id,
      name: court.name,
      surface: court.surface,
      capacity: court.capacity_label,
      pricePerHour: court.price_per_hour,
      status: court.status,
      bookingMode: court.booking_mode === "open_play" ? "open-play" : "private",
      openPlayCapacity: court.open_play_capacity ?? undefined,
      availableSlots: court.available_slots,
      imageUrl: court.image_url ?? undefined,
    })),
  }
}
