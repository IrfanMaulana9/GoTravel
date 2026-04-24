"use client"

import { useEffect, useRef } from "react"
import type { PickupLocation } from "@/types/pickup-location"

interface PickupLocationMapProps {
  pickupLocations: PickupLocation[]
  center?: { latitude: number; longitude: number }
  height?: string
}

export function PickupLocationMap({ pickupLocations, center, height = "400px" }: PickupLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // @ts-ignore
    const L = window.L
    if (!L) return

    const defaultCenter = center || {
      latitude: pickupLocations[0]?.latitude || -6.2088,
      longitude: pickupLocations[0]?.longitude || 106.8456,
    }

    const map = L.map(mapRef.current).setView([defaultCenter.latitude, defaultCenter.longitude], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Custom icon for pickup locations
    const pickupIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: oklch(0.55 0.20 250); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 18px;">📍</span>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    // Add markers for each pickup location
    pickupLocations.forEach((location, index) => {
      const marker = L.marker([location.latitude, location.longitude], {
        icon: pickupIcon,
      }).addTo(map)

      const popupContent = `
        <div style="font-family: system-ui; min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: oklch(0.55 0.20 250);">
            ${index + 1}. ${location.name}
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
            ${location.address}
          </div>
          ${
            location.pickup_time
              ? `<div style="font-size: 12px; font-weight: 500; color: oklch(0.62 0.18 200);">
            ⏰ ${location.pickup_time}
          </div>`
              : ""
          }
        </div>
      `

      marker.bindPopup(popupContent)
    })

    // Fit bounds to show all markers
    if (pickupLocations.length > 0) {
      const bounds = L.latLngBounds(pickupLocations.map((loc) => [loc.latitude, loc.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      map.remove()
    }
  }, [pickupLocations, center])

  return (
    <div>
      <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-xl border-2 border-border shadow-lg" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
    </div>
  )
}
