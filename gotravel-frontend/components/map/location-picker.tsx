"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { searchLocation, type GeocodeSuggestion } from "@/lib/geocode"
import { toast } from "sonner"

interface LocationPickerProps {
  onLocationSelect: (location: { name: string; address: string; latitude: number; longitude: number }) => void
  initialLocation?: { latitude: number; longitude: number }
  token?: string
}

export function LocationPicker({ onLocationSelect, initialLocation, token }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // @ts-ignore
    const L = window.L
    if (!L) return

    const initialLat = initialLocation?.latitude || -6.2088
    const initialLng = initialLocation?.longitude || 106.8456

    const newMap = L.map(mapRef.current).setView([initialLat, initialLng], 13)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(newMap)

    const newMarker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(newMap)

    newMarker.on("dragend", async (e: any) => {
      const position = e.target.getLatLng()
      try {
        const response = await fetch("/api/geocode/reverse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            latitude: position.lat,
            longitude: position.lng,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          onLocationSelect({
            name: result.data.details?.road || "Custom Location",
            address: result.data.address,
            latitude: position.lat,
            longitude: position.lng,
          })
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error)
      }
    })

    setMap(newMap)
    setMarker(newMarker)

    return () => {
      newMap.remove()
    }
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await searchLocation(searchQuery, token)
      setSuggestions(results)
    } catch (error) {
      toast.error("Gagal mencari lokasi")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSuggestion = (suggestion: GeocodeSuggestion) => {
    if (map && marker) {
      map.setView([suggestion.latitude, suggestion.longitude], 15)
      marker.setLatLng([suggestion.latitude, suggestion.longitude])
      onLocationSelect({
        name: suggestion.name,
        address: suggestion.address,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      })
      setSuggestions([])
      setSearchQuery("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Cari alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {suggestions.length > 0 && (
        <Card className="p-2 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left p-3 hover:bg-muted rounded-lg flex items-start gap-3 transition-colors"
            >
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{suggestion.name}</div>
                <div className="text-xs text-muted-foreground truncate">{suggestion.address}</div>
              </div>
            </button>
          ))}
        </Card>
      )}

      <div ref={mapRef} className="w-full h-[400px] rounded-xl border-2 border-border" />

      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        <span>Drag marker untuk memilih lokasi atau cari alamat di atas</span>
      </div>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
    </div>
  )
}
