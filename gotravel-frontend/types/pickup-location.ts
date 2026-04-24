export interface PickupLocation {
  id: number
  travel_id: number
  name: string
  address: string
  latitude: number
  longitude: number
  pickup_time: string | null
  order: number
  created_at: string
  updated_at: string
}

export interface CreatePickupLocationDto {
  name: string
  address: string
  latitude: number
  longitude: number
  pickup_time?: string
  order: number
}
