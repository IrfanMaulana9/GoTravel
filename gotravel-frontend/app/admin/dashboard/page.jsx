"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import {
  Bus,
  Users,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  LogOut,
  Settings,
  Shield,
  Activity,
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/login")
      return
    }

    fetchStats()
  }, [isAuthenticated, user, authLoading, router])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      } else {
        toast.error(response.message || "Gagal memuat statistik dashboard")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error(error.response?.data?.message || "Gagal memuat statistik dashboard")
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
          <Shield className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GoTravel Admin
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:block">Admin: {user?.name}</span>
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola seluruh sistem GoTravel dari sini</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Pengguna terdaftar</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Building className="w-4 h-4" />
                Total Agen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_agents || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Agen terverifikasi</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
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

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_bookings || 0}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+{stats?.growth_rate || 0}% bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary to-secondary text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <DollarSign className="w-6 h-6" />
              Total Pendapatan Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold mb-2">Rp {(stats?.total_revenue || 0).toLocaleString("id-ID")}</div>
            <p className="text-white/80">Total transaksi keseluruhan</p>
          </CardContent>
        </Card>

        {/* Management Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Kelola Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Lihat dan kelola semua pengguna terdaftar</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/agents">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Kelola Agen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Verifikasi dan kelola agen travel</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Kelola Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Monitor semua transaksi booking</p>
              </CardContent>
            </Card>
          </Link>



          <Link href="/admin/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Laporan & Analitik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Lihat laporan dan statistik lengkap</p>
              </CardContent>
            </Card>
          </Link>


        </div>
      </div>
    </div>
  )
}
