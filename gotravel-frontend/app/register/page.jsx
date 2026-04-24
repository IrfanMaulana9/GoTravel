"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validasi password match
    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi password tidak cocok")
      setLoading(false)
      return
    }

    // Validasi password minimal 6 karakter
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter")
      setLoading(false)
      return
    }

    try {
      const result = await register(formData)

      if (result.success) {
        setSuccess(true)
        toast.success("Registrasi berhasil! Silakan login.")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(result.message || "Registrasi gagal")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Background Gradient & Shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 z-0"></div>
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 md:p-12 overflow-hidden">
        
        {/* Left Side: Illustration / Brand */}
        <div className="hidden md:flex flex-col justify-center space-y-8 p-6 order-2 md:order-1">
          <div className="space-y-4">
             <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Car className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
               Bergabung Bersama Kami
             </h1>
             <p className="text-lg text-gray-600 leading-relaxed">
               Nikmati kemudahan booking travel dengan harga terbaik dan banyak pilihan armada.
             </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-gray-600">Proses booking cepat & mudah</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-gray-600">Harga transparan tanpa biaya tersembunyi</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-gray-600">Dukungan pelanggan 24/7</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-md mx-auto order-1 md:order-2">
            <div className="space-y-2 mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Buat Akun Baru</h2>
                <p className="text-gray-500">Isi data diri Anda untuk memulai.</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-6 bg-green-50 text-green-900 border-green-200 animate-in slide-in-from-top-2">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Registrasi berhasil! Mengalihkan ke halaman login...</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Nama Lengkap"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                    required
                    />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min 6 karakter"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10 pr-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                            required
                            />
                            <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi</Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ulangi"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                            required
                            />
                        </div>
                    </div>
                </div>

                <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 rounded-xl mt-4"
                disabled={loading || success}
                >
                {loading ? "Memproses..." : "Daftar Sekarang"}
                </Button>
            </form>

            <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-gray-600">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                    Masuk di sini
                </Link>
                </p>
                <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 block transition-colors mt-4">
                ← Kembali ke Beranda
                </Link>
            </div>
        </div>
      </div>
    </div>
  )
}
