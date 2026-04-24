"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { bookingAPI, formatPrice } from "@/lib/api"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Eye,
  Star,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"

export default function UserDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "user") {
      router.push(user?.role === "admin" ? "/admin/dashboard" : "/agent/dashboard")
      return
    }

    fetchBookings()
  }, [isAuthenticated, user, authLoading, router])

  const fetchBookings = async (status = null) => {
    setLoading(true)
    try {
      const params = status && status !== "all" ? { status } : {}
      const response = await bookingAPI.getAll(params)
      if (response.success) {
        setBookings(response.data?.data || response.data || [])
      } else {
        toast.error(response.message || "Gagal memuat data booking")
      }
    } catch (error) {
      console.error("❌ Error fetching bookings:", error)
      console.error("❌ Error response:", error.response)
      console.error("❌ Error data:", error.response?.data)
      
      let errorMessage = "Gagal memuat data booking"
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
    fetchBookings(value === "all" ? null : value)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4" />
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Saya</h1>
          <p className="text-muted-foreground">Kelola booking dan perjalanan Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Menunggu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Dikonfirmasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Selesai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Riwayat Booking</CardTitle>
              <Link href="/travels">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90">
                  <MapPin className="w-4 h-4 mr-2" />
                  Cari Travel Baru
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="pending">Menunggu</TabsTrigger>
                <TabsTrigger value="confirmed">Dikonfirmasi</TabsTrigger>
                <TabsTrigger value="completed">Selesai</TabsTrigger>
                <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada booking</h3>
                    <p className="text-gray-600 mb-6">Mulai cari travel dan buat booking pertama Anda!</p>
                    <Link href="/travels">
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90">
                        Cari Travel
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">
                                  {booking.travel?.agent_name || "Travel"}
                                </h3>
                                <Badge {...getStatusBadge(booking.status)} className="flex items-center gap-1">
                                  {getStatusIcon(booking.status)}
                                  {getStatusText(booking.status)}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>
                                    {booking.travel?.from_city} → {booking.travel?.to_city}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(booking.travel_date).toLocaleDateString("id-ID")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{booking.quantity} penumpang</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold text-green-600">
                                    {formatPrice(booking.total_price)}
                                  </span>
                                </div>
                                {booking.payment_status && (
                                  <Badge
                                    variant={
                                      booking.payment_status === "paid" ? "outline" : "secondary"
                                    }
                                    className={
                                      booking.payment_status === "paid"
                                        ? "border-green-500 text-green-700 bg-green-50"
                                        : ""
                                    }
                                  >
                                    {booking.payment_status === "paid" ? "Lunas" : "Belum Lunas"}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Link href={`/bookings/${booking.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Detail
                                </Button>
                              </Link>
                              {booking.status === "completed" && !booking.review && (
                                <Link href={`/bookings/${booking.id}/review`}>
                                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90">
                                    <Star className="w-4 h-4 mr-2" />
                                    Beri Review
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

