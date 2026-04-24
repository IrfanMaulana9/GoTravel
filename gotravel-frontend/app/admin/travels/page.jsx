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
import { toast } from "sonner"
import {
  Shield,
  LogOut,
  ChevronLeft,
  Search,
  Eye,
  Calendar,
  MapPin,
  Clock
} from "lucide-react"

export default function AdminTravelsPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [travels, setTravels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
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

    fetchTravels()
  }, [isAuthenticated, user, authLoading, router, page, search])

  const fetchTravels = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllTravels({ page, search, per_page: 10 })
      if (response.success) {
        setTravels(response.data.data)
        setPagination(response.data)
      } else {
        toast.error(response.message || "Gagal memuat data travel")
      }
    } catch (error) {
      console.error("Error fetching travels:", error)
      toast.error("Terjadi kesalahan saat memuat data travel")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchTravels()
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
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
                  Kelola Travel
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
             <CardTitle>Daftar Travel</CardTitle>
             <form onSubmit={handleSearch} className="flex gap-2">
               <Input 
                 placeholder="Cari rute atau kota..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-64"
               />
               <Button type="submit" size="icon">
                 <Search className="w-4 h-4" />
               </Button>
             </form>
          </CardHeader>
          <CardContent>
             {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rute</TableHead>
                      <TableHead>Jadwal</TableHead>
                      <TableHead>Kendaraan</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Sisa Kursi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {travels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Tidak ada travel ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      travels.map((travel) => (
                        <TableRow key={travel.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 font-medium">
                               <MapPin className="w-4 h-4 text-primary" />
                               {travel.origin_city} ➝ {travel.destination_city}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                {new Date(travel.departure_date).toLocaleDateString("id-ID")}
                              </span>
                              <span className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                {travel.departure_time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{travel.car_model}</div>
                            <div className="text-xs text-muted-foreground">{travel.license_plate}</div>
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatPrice(travel.price)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={travel.available_seats > 0 ? "outline" : "destructive"}>
                              {travel.available_seats} Kursi
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon" asChild>
                               <Link href={`/travels/${travel.id}`}>
                                 <Eye className="w-4 h-4" />
                               </Link>
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
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
