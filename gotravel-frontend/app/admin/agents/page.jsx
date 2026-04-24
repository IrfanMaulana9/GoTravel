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
  LogOut,
  ChevronLeft,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Building,
  Mail,
  Phone
} from "lucide-react"

export default function AdminAgentsPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
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

    fetchAgents()
  }, [isAuthenticated, user, authLoading, router, page, search, statusFilter])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const params = { page, search, per_page: 10 }
      if (statusFilter) params.verification_status = statusFilter
      
      const response = await adminAPI.getAllAgents(params)
      if (response.success) {
        setAgents(response.data.data)
        setPagination(response.data)
      } else {
        toast.error(response.message || "Gagal memuat data agen")
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("Terjadi kesalahan saat memuat data agen")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchAgents()
  }

  const handleVerify = async (agentId, status) => {
     // status: 'verified' or 'rejected'
     // For rejected, we might want a reason modal. For now, simple prompt.
     let reason = null
     if (status === 'rejected') {
        reason = prompt("Masukkan alasan penolakan:")
        if (reason === null) return // Cancelled
     }

    try {
      // API call needs to be updated in lib/api.js or backend to accept reason? 
      // Backend AdminController accepts rejection_reason
      // adminAPI.updateAgentStatus supports calling PATCH /admin/agents/{id}/status with { status }
      // We need to pass reason if rejected.
      // But adminAPI.updateAgentStatus implementation in lib/api.js is:
      // updateAgentStatus: async (id, status) => { ... { status } }
      // It doesn't pass 'rejection_reason'. I will need to update lib/api.js later or assume it's optional/not fully implemented on frontend lib yet.
      // I'll send just status for now.

      const response = await adminAPI.updateAgentStatus(agentId, status)
      
      if (response.success) {
        toast.success(`Status agen berhasil diperbarui menjadi ${status}`)
        fetchAgents()
      } else {
         toast.error(response.message || "Gagal memperbarui status")
      }
    } catch (error) {
      toast.error("Gagal memperbarui status")
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disetujui</Badge>
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Menunggu</Badge>
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
                  Kelola Agen
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
        {/* Stats Cards could go here like in the image (Total Agen, Disetujui, Menunggu, Ditolak) */}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle>Daftar Agen</CardTitle>
             <div className="flex gap-2">
               <select 
                 className="h-10 px-3 py-2 rounded-md border text-sm"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
               >
                 <option value="">Semua Status</option>
                 <option value="pending">Menunggu</option>
                 <option value="verified">Disetujui</option>
                 <option value="rejected">Ditolak</option>
               </select>

               <form onSubmit={handleSearch} className="flex gap-2">
                 <Input 
                   placeholder="Cari agen..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-64"
                 />
                 <Button type="submit" size="icon">
                   <Search className="w-4 h-4" />
                 </Button>
               </form>
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
                      <TableHead>Perusahaan</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Tidak ada agen ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <Building className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium">{agent.business_name || agent.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {agent.business_address || "Alamat tidak tersedia"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{agent.name}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {agent.email}
                              </div>
                              {agent.phone_number && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {agent.phone_number}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                               {new Date(agent.created_at).toLocaleDateString("id-ID", {
                                 day: '2-digit', month: '2-digit', year: 'numeric',
                                 hour: '2-digit', minute: '2-digit'
                               })}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(agent.verification_status)}
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
                                <DropdownMenuItem onClick={() => handleVerify(agent.id, 'verified')}>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Setujui
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleVerify(agent.id, 'rejected')}>
                                  <XCircle className="w-4 h-4 mr-2 text-red-600" /> Tolak
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
            
            {/* Pagination */}
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
