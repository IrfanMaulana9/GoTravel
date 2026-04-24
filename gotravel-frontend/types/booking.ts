import type { PickupLocation } from "./pickup-location"

export interface Booking {
  id: number
  booking_code: string
  user_id: number
  travel_id: number
  pickup_location_id: number | null
  customer_name: string
  customer_phone: string
  customer_email: string
  seats: number
  total_price: number
  travel_date: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes: string | null
  created_at: string
  updated_at: string
  travel?: any
  pickup_location?: PickupLocation
}

export interface CreateBookingDto {
  travel_id: number
  pickup_location_id?: number
  customer_name: string
  customer_phone: string
  customer_email: string
  seats: number
  travel_date: string
  notes?: string
}
