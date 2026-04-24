const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface GeocodeSuggestion {
  name: string
  latitude: number
  longitude: number
  address: string
  type: string
  importance: number
}

export interface ReverseGeocodeResult {
  address: string
  latitude: number
  longitude: number
  details: {
    road?: string
    city?: string
    state?: string
    country?: string
  }
}

export async function searchLocation(address: string, token?: string): Promise<GeocodeSuggestion[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/geocode/search`, {
    method: "POST",
    headers,
    body: JSON.stringify({ address }),
  })

  if (!response.ok) {
    throw new Error("Failed to search location")
  }

  const result = await response.json()
  return result.data || []
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  token?: string,
): Promise<ReverseGeocodeResult> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/geocode/reverse`, {
    method: "POST",
    headers,
    body: JSON.stringify({ latitude, longitude }),
  })

  if (!response.ok) {
    throw new Error("Failed to reverse geocode")
  }

  const result = await response.json()
  return result.data
}
