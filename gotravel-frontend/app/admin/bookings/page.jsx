"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { adminAPI, formatPrice } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Shield,
  LogOut,
  ChevronLeft,
  Search,
  MoreVertical,
  Eye,
  Calendar,
  User,
  Bus
} from "lucide-react"

export default function AdminBookingsPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

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

    fetchBookings()
  }, [isAuthenticated, user, authLoading, router, page, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 10 }
      if (statusFilter) params.status = statusFilter
      
      const response = await adminAPI.getAllBookings(params)
      if (response.success) {
        setBookings(response.data.data)
        setPagination(response.data)
      } else {
        toast.error(response.message || "Gagal memuat data booking")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Terjadi kesalahan saat memuat data booking")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Terkonfirmasi</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Selesai</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Kelola Booking
                </span>
              </div>
            </div>

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle>Semua Booking</CardTitle>
             <div className="flex gap-2">
               <select 
                 className="h-10 px-3 py-2 rounded-md border text-sm"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
               >
                 <option value="">Semua Status</option>
                 <option value="pending">Menunggu</option>
                 <option value="confirmed">Terkonfirmasi</option>
                 <option value="completed">Selesai</option>
                 <option value="cancelled">Dibatalkan</option>
               </select>
             </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Booking</TableHead>
                      <TableHead>Penumpang</TableHead>
                      <TableHead>Rute</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Agen</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Tidak ada booking ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.booking_code || (booking.id ? String(booking.id).substring(0,8).toUpperCase() : "-")}
                            <div className="text-xs text-muted-foreground">
                              {new Date(booking.created_at).toLocaleDateString("id-ID")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* <User className="w-4 h-4 text-muted-foreground" /> */}
                              <div>
                                <div className="text-sm font-medium">{booking.user?.name || "Guest"}</div>
                                <div className="text-xs text-muted-foreground">
                                  {booking.user?.phone_number || "-"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {booking.travel?.from_city || "?"} → {booking.travel?.to_city || "?"}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Bus className="w-3 h-3" />
                              {booking.travel?.car_model || "Kendaraan"}
                            </div>
                          </TableCell>
                          <TableCell>
                             <div className="text-sm">
                               {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString("id-ID") : "-"}
                             </div>
                             <div className="text-xs text-muted-foreground">
                               {booking.travel?.depart_time ? booking.travel.depart_time.substring(0, 5) : "-"}
                             </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{booking.agent?.business_name || booking.agent?.name || "-"}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(booking.total_price)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {}}>
                                  <Eye className="w-4 h-4 mr-2" /> Detail
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination... same logic */}
             {pagination && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Halaman {pagination.current_page} dari {pagination.last_page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                  disabled={page === pagination.last_page}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
