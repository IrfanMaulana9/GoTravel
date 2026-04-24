"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { travelAPI, bookingAPI, formatPrice, formatTime } from "@/lib/api"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  Loader2,
  User,
  Phone,
  Home,
  MapPinned,
  FileText,
} from "lucide-react"

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [travel, setTravel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    travel_date: "",
    quantity: 1,
    passenger_name: "",
    passenger_phone: "",
    passenger_address: "",
    pickup_location: "",
    notes: "",
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "user") {
      router.push("/travels")
      return
    }

    // Pre-fill user data
    setFormData(prev => ({
      ...prev,
      passenger_name: prev.passenger_name || user?.name || "",
      passenger_phone: prev.passenger_phone || user?.phone || "",
      passenger_address: prev.passenger_address || user?.address || "",
    }))

    if (params.id) {
      fetchTravelDetail()
    }
  }, [params.id, isAuthenticated, user, authLoading, router])

  const fetchTravelDetail = async () => {
    setLoading(true)
    try {
      const response = await travelAPI.getById(params.id)
      if (response.success) {
        setTravel(response.data)
        // Set min date to today
        const today = new Date().toISOString().split("T")[0]
        setFormData((prev) => ({ ...prev, travel_date: prev.travel_date || today }))
      } else {
        toast.error(response.message || "Gagal memuat detail travel")
        router.push("/travels")
      }
    } catch (error) {
      console.error("Error fetching travel detail:", error)
      toast.error(error.response?.data?.message || "Gagal memuat detail travel")
      router.push("/travels")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!travel) return

    // Validation
    if (formData.quantity < 1) {
      toast.error("Jumlah penumpang minimal 1")
      return
    }

    if (formData.quantity > travel.available_seats) {
      toast.error(`Kursi tersedia hanya ${travel.available_seats}`)
      return
    }

    if (!formData.travel_date) {
      toast.error("Pilih tanggal perjalanan")
      return
    }

    if (!formData.passenger_name || !formData.passenger_phone) {
      toast.error("Nama dan nomor telepon wajib diisi")
      return
    }

    setSubmitting(true)
    try {
      const bookingData = {
        travel_id: travel.id,
        travel_date: formData.travel_date,
        quantity: formData.quantity,
        passenger_name: formData.passenger_name,
        passenger_phone: formData.passenger_phone,
        passenger_address: formData.passenger_address,
        pickup_location: formData.pickup_location,
        notes: formData.notes,
      }

      const response = await bookingAPI.create(bookingData)

      if (response.success) {
        toast.success("Booking berhasil dibuat!")
        router.push(`/bookings/${response.data.id}`)
      } else {
        toast.error(response.message || "Gagal membuat booking")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error(error.response?.data?.message || "Gagal membuat booking")
    } finally {
      setSubmitting(false)
    }
  }

  const totalPrice = travel ? travel.price * formData.quantity : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat detail travel...</p>
        </div>
      </div>
    )
  }

  if (!travel) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link href={`/travels/${travel.id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Detail Travel
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Form Booking</CardTitle>
                <CardDescription>Lengkapi data berikut untuk melakukan booking</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Travel Date & Quantity */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="travel_date" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Tanggal Perjalanan *
                      </Label>
                      <Input
                        id="travel_date"
                        name="travel_date"
                        type="date"
                        value={formData.travel_date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Jumlah Penumpang *
                      </Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        max={travel.available_seats}
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Kursi tersedia: {travel.available_seats}
                      </p>
                    </div>
                  </div>

                  {/* Passenger Info */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Data Penumpang
                    </h3>

                    <div>
                      <Label htmlFor="passenger_name">Nama Lengkap *</Label>
                      <Input
                        id="passenger_name"
                        name="passenger_name"
                        value={formData.passenger_name}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="passenger_phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Nomor Telepon *
                      </Label>
                      <Input
                        id="passenger_phone"
                        name="passenger_phone"
                        type="tel"
                        value={formData.passenger_phone}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="passenger_address" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Alamat
                      </Label>
                      <Textarea
                        id="passenger_address"
                        name="passenger_address"
                        value={formData.passenger_address}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MapPinned className="w-5 h-5" />
                      Informasi Tambahan
                    </h3>

                    <div>
                      <Label htmlFor="pickup_location">Lokasi Penjemputan</Label>
                      <Input
                        id="pickup_location"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleInputChange}
                        placeholder="Contoh: Terminal Bus, Alamat, dll"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Catatan (Opsional)
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Catatan khusus untuk agen..."
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || travel.available_seats <= 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 text-lg py-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Konfirmasi Booking"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <CardTitle>Ringkasan Booking</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Rute:</span>
                    <span className="font-medium ml-auto">
                      {travel.from_city} → {travel.to_city}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Waktu:</span>
                    <span className="font-medium ml-auto">
                      {formatTime(travel.depart_time)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Penumpang:</span>
                    <span className="font-medium ml-auto">{formData.quantity} orang</span>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harga per kursi:</span>
                      <span>{formatPrice(travel.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Jumlah kursi:</span>
                      <span>{formData.quantity}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {travel.available_seats <= 0 && (
                  <Badge variant="destructive" className="w-full justify-center">
                    Kursi Penuh
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

