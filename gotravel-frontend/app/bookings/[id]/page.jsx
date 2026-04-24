"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { bookingAPI, formatPrice, formatTime } from "@/lib/api"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
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
  CheckCircle2,
  XCircle,
  Star,
  DollarSign,
} from "lucide-react"

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (params.id) {
      fetchBookingDetail()
    }
  }, [params.id, isAuthenticated, authLoading, router])

  const fetchBookingDetail = async () => {
    setLoading(true)
    try {
      const response = await bookingAPI.getById(params.id)
      if (response.success) {
        setBooking(response.data)
      } else {
        toast.error(response.message || "Gagal memuat detail booking")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching booking detail:", error)
      toast.error(error.response?.data?.message || "Gagal memuat detail booking")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "outline", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
      confirmed: { variant: "outline", className: "border-blue-500 text-blue-700 bg-blue-50" },
      completed: { variant: "outline", className: "border-green-500 text-green-700 bg-green-50" },
      cancelled: { variant: "outline", className: "border-red-500 text-red-700 bg-red-50" },
    }
    return variants[status] || variants.pending
  }

  const getStatusText = (status) => {
    const texts = {
      pending: "Menunggu Konfirmasi",
      confirmed: "Dikonfirmasi",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    }
    return texts[status] || status
  }

  const handleCancelBooking = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan booking ini?")) return

    try {
      const response = await bookingAPI.cancel(params.id)
      if (response.success) {
        toast.success("Booking berhasil dibatalkan")
        fetchBookingDetail()
      } else {
        toast.error(response.message || "Gagal membatalkan booking")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error(error.response?.data?.message || "Gagal membatalkan booking")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat detail booking...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  const canCancel = booking.status === "pending" || booking.status === "confirmed"
  const canReview = booking.status === "completed" && !booking.review

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Detail Booking</CardTitle>
                    <CardDescription>ID Booking: #{booking.id}</CardDescription>
                  </div>
                  <Badge {...getStatusBadge(booking.status)} className="text-sm px-4 py-2">
                    {getStatusText(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Travel Info */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-lg mb-4">Informasi Perjalanan</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Rute</p>
                        <p className="font-medium">
                          {booking.travel?.from_city} → {booking.travel?.to_city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal Perjalanan</p>
                        <p className="font-medium">
                          {new Date(booking.travel_date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Waktu Berangkat</p>
                        <p className="font-medium">
                          {formatTime(booking.travel?.depart_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Jumlah Penumpang</p>
                        <p className="font-medium">{booking.quantity} orang</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Info */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-lg mb-4">Data Penumpang</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nama</p>
                        <p className="font-medium">{booking.passenger_name}</p>
                      </div>
                    </div>
                    {booking.passenger_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Telepon</p>
                          <p className="font-medium">{booking.passenger_phone}</p>
                        </div>
                      </div>
                    )}
                    {booking.passenger_address && (
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Alamat</p>
                          <p className="font-medium">{booking.passenger_address}</p>
                        </div>
                      </div>
                    )}
                    {booking.pickup_location && (
                      <div className="flex items-center gap-3">
                        <MapPinned className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Lokasi Penjemputan</p>
                          <p className="font-medium">{booking.pickup_location}</p>
                        </div>
                      </div>
                    )}
                    {booking.notes && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Catatan</p>
                          <p className="font-medium">{booking.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {canCancel && (
                    <Button
                      variant="destructive"
                      onClick={handleCancelBooking}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Batalkan Booking
                    </Button>
                  )}
                  {canReview && (
                    <Link href={`/bookings/${booking.id}/review`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90">
                        <Star className="w-4 h-4 mr-2" />
                        Beri Review
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Summary */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <CardTitle>Ringkasan Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harga per kursi:</span>
                    <span>{formatPrice(booking.travel?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jumlah kursi:</span>
                    <span>{booking.quantity}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatPrice(booking.total_price)}</span>
                  </div>
                </div>

                {booking.payment_status && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status Pembayaran:</span>
                      <Badge
                        variant={booking.payment_status === "paid" ? "outline" : "secondary"}
                        className={
                          booking.payment_status === "paid"
                            ? "border-green-500 text-green-700 bg-green-50"
                            : ""
                        }
                      >
                        {booking.payment_status === "paid" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Lunas
                          </>
                        ) : (
                          "Belum Lunas"
                        )}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Info */}
            {booking.agent && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Agen Travel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{booking.agent?.business_name || booking.agent?.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.agent?.email}</p>
                    {booking.agent?.phone && (
                      <p className="text-sm text-muted-foreground">{booking.agent.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

