"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authAPI } from "@/lib/api"
import { toast } from "sonner"
import { Bus, ArrowLeft, Building, Phone, Mail, User, Lock, FileText } from "lucide-react"

export default function AgentRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    business_name: "",
    business_address: "",
    business_license: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, business_license: e.target.files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password_confirmation) {
      toast.error("Password tidak cocok!")
      return
    }

    setLoading(true)

    try {
      const result = await authAPI.registerAgent(formData)

      if (result.success) {
        toast.success("Pendaftaran agen berhasil! Silakan login.")
        router.push("/login")
      } else {
        toast.error(result.message || "Pendaftaran gagal")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <Bus className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GoTravel
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Daftar Sebagai Agen</h1>
            <p className="text-muted-foreground">Bergabung dan kelola travel Anda bersama kami</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="agent@example.com"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Nama Travel
                </Label>
                <Input
                  id="business_name"
                  name="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="ABC Travel"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Konfirmasi Password
                </Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Alamat Travel
              </Label>
              <Textarea
                id="business_address"
                name="business_address"
                value={formData.business_address}
                onChange={handleChange}
                placeholder="Jl. Contoh No. 123, Jakarta"
                required
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_license" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Izin Usaha / SIUP (PDF/JPG/PNG)
              </Label>
              <div className="relative">
                <Input
                  id="business_license"
                  name="business_license"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="h-12 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>
              <p className="text-sm text-muted-foreground">Upload izin usaha atau SIUP yang masih berlaku</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg"
            >
              {loading ? "Mendaftar..." : "Daftar Sebagai Agen"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Sudah punya akun? </span>
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Login di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
