"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Check, X } from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Lokasi Penjemputan</Popup>
    </Marker>
  )
}

export default function PickupLocationSelector({ onConfirm, onCancel, initialCity = "Bandung" }) {
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState("")
  const [cityCenter, setCityCenter] = useState([-6.9175, 107.6191]) // Default: Bandung

  useEffect(() => {
    // Get city coordinates
    if (initialCity) {
      // You can add more cities here
      const cityCoords = {
        Bandung: [-6.9175, 107.6191],
        Jakarta: [-6.2088, 106.8456],
        Surabaya: [-7.2575, 112.7521],
        Yogyakarta: [-7.7956, 110.3695],
      }
      setCityCenter(cityCoords[initialCity] || [-6.9175, 107.6191])
    }
  }, [initialCity])

  useEffect(() => {
    if (position) {
      // Reverse geocoding to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
        .then((res) => res.json())
        .then((data) => {
          setAddress(data.display_name || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`)
        })
    }
  }, [position])

  const handleConfirm = () => {
    if (position) {
      onConfirm({
        latitude: position.lat,
        longitude: position.lng,
        address: address,
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Pilih Lokasi Penjemputan
          </h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">Petunjuk Penggunaan:</p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• Klik pada peta untuk menandai lokasi penjemputan</li>
            <li>• Seret peta untuk melihat area lain</li>
            <li>• Scroll untuk zoom in/out</li>
            <li>• Marker merah menunjukkan lokasi yang dipilih</li>
          </ul>
        </div>

        {position && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-semibold text-green-900">Lokasi dipilih</p>
                <p className="text-sm text-green-800">{address}</p>
                <p className="text-xs text-green-700">
                  Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="h-[400px] rounded-xl overflow-hidden border-2 border-border shadow-lg">
          <MapContainer center={cityCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={!position} className="bg-gradient-to-r from-primary to-secondary">
            <Check className="w-4 h-4 mr-2" />
            Konfirmasi Lokasi
          </Button>
        </div>
      </div>
    </Card>
  )
}
