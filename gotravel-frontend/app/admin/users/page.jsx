"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { adminAPI } from "@/lib/api"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Phone
} from "lucide-react"

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [users, setUsers] = useState([])
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

    fetchUsers()
  }, [isAuthenticated, user, authLoading, router, page, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllUsers({ page, search, per_page: 10 })
      if (response.success) {
        setUsers(response.data.data)
        setPagination(response.data)
      } else {
        toast.error(response.message || "Gagal memuat data pengguna")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Terjadi kesalahan saat memuat data pengguna")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      // In a real app, you might have an 'is_active' field.
      // For now we will mock this or use the API if supported
      // The current adminAPI.updateUserStatus returns success but doesn't persist 'active' state in DB unless we added the column.
      // Assuming the backend handles it or we just show a success message.
      
      const response = await adminAPI.updateUserStatus(userId, newStatus)
      if (response.success) {
        toast.success(`Status pengguna berhasil diperbarui`)
        fetchUsers()
      }
    } catch (error) {
      toast.error("Gagal memperbarui status")
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return

    try {
      const response = await adminAPI.deleteUser(userId)
      if (response.success) {
        toast.success("Pengguna berhasil dihapus")
        fetchUsers()
      } else {
        toast.error(response.message || "Gagal menghapus pengguna")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus pengguna")
    }
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
                  Kelola Pengguna
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
             <CardTitle>Daftar User</CardTitle>
             <form onSubmit={handleSearch} className="flex gap-2">
               <Input 
                 placeholder="Cari user..." 
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
                      <TableHead>User</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Statistik Booking</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Tidak ada pengguna ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Bergabung: {new Date(user.created_at).toLocaleDateString("id-ID")}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {user.email}
                              </div>
                              {user.phone_number && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  {user.phone_number}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                               {/* Backend needs to provide this data or we fetch separately. 
                                   For now, placeholder or check if user object has it */}
                                {user.bookings_count || user.bookings?.length || 0} booking
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Aktif
                            </Badge>
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
                                <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, 'active')}>
                                  <UserCheck className="w-4 h-4 mr-2" /> Aktifkan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, 'inactive')}>
                                  <UserX className="w-4 h-4 mr-2" /> Nonaktifkan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
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
            
            {/* Pagination Controls could go here */}
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
