"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { agentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { Bus, Calendar, DollarSign, TrendingUp, Plus, LogOut, Settings, BarChart3, Clock } from "lucide-react"

export default function AgentDashboard() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)
  const [travels, setTravels] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login")
      return
    }

    if (isAuthenticated && user?.role !== "agent") {
      router.push("/login")
      return
    }

    if (isAuthenticated && user?.role === "agent") {
      fetchData()
    }
  }, [isAuthenticated, user, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsData, travelsData, bookingsData] = await Promise.all([
        agentAPI.getStats(),
        agentAPI.getTravels({ limit: 5 }),
        agentAPI.getBookings({ limit: 10 }),
      ])

      if (statsData.success) {
        setStats(statsData.data)
      }
      if (travelsData.success) {
        setTravels(travelsData.data || [])
      }
      if (bookingsData.success) {
        setBookings(bookingsData.data || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error(error.response?.data?.message || "Gagal memuat data dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Bus className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GoTravel
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:block">{user?.agency_name || user?.name}</span>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Agen</h1>
          <p className="text-muted-foreground">Selamat datang kembali, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Bus className="w-4 h-4" />
                Total Travel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_travels || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Travel aktif</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_bookings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Booking keseluruhan</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                Rp {(stats?.total_revenue || 0).toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total pendapatan</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.monthly_bookings || 0}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+{stats?.growth_rate || 0}% dari bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/agent/travels/create">
                <Button className="w-full h-20 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Plus className="w-5 h-5 mr-2" />
                  Tambah Travel Baru
                </Button>
              </Link>
              <Link href="/agent/bookings">
                <Button variant="outline" className="w-full h-20 border-2 bg-transparent">
                  <Calendar className="w-5 h-5 mr-2" />
                  Lihat Semua Booking
                </Button>
              </Link>
              <Link href="/agent/stats">
                <Button variant="outline" className="w-full h-20 border-2 bg-transparent">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Statistik Lengkap
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Travels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="w-5 h-5" />
                Travel Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {travels.length > 0 ? (
                <div className="space-y-4">
                  {travels.map((travel) => (
                    <div key={travel.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-semibold">
                          {travel.origin} → {travel.destination}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {travel.departure_time} • {travel.available_seats} kursi tersedia
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">Rp {travel.price.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada travel</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-semibold">{booking.customer_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {booking.booking_date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada booking</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
