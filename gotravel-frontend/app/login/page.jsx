"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "agent") {
        router.push("/agent/dashboard");
      } else {
        router.push("/travels");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setShowSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowSuccess(false);

    try {
      console.log("🔵 Starting login process...");
      console.log("Email:", formData.email);

      // Call login function from AuthContext
      const result = await login(formData.email, formData.password);

      console.log("🟢 Login result:", result);

      if (result && result.success) {
        console.log("✅ Login successful!");
        console.log("User data:", result.user);

        setShowSuccess(true);
        toast.success("Login berhasil! Mengalihkan...");

        // Small delay for better UX
        setTimeout(() => {
          const userRole = result.user?.role;

          // Redirect based on role
          if (userRole === "admin") {
            router.push("/admin/dashboard");
          } else if (userRole === "agent") {
            router.push("/agent/dashboard");
          } else if (userRole === "user") {
            router.push("/travels");
          } else {
            // Default redirect
            router.push("/travels");
          }
        }, 500);
      } else {
        const errorMessage = result?.message || "Email atau password salah";
        console.error("❌ Login failed:", errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("❌ Login exception:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        code: err.code,
      });

      let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Background Gradient & Shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 z-0"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 md:p-12 overflow-hidden">
        
        {/* Left Side: Illustration / Brand */}
        <div className="hidden md:flex flex-col justify-center space-y-8 p-6">
          <div className="space-y-4">
             <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Car className="w-8 h-8 text-white" />
             </div>
             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
               GoTravel
             </h1>
             <p className="text-lg text-gray-600 leading-relaxed">
               Platform travel nomor #1 untuk perjalanan yang aman, nyaman, dan terpercaya ke seluruh Indonesia.
             </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-white/50 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <h3 className="font-bold text-blue-600 text-xl">5000+</h3>
                <p className="text-sm text-gray-500">Pengguna Aktif</p>
             </div>
             <div className="p-4 bg-white/50 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <h3 className="font-bold text-indigo-600 text-xl">4.9/5</h3>
                <p className="text-sm text-gray-500">Rating Customer</p>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="space-y-2 mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang Kembali</h2>
            <p className="text-gray-500">Masuk untuk mengelola perjalanan Anda.</p>
          </div>

            {error && (
              <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {showSuccess && (
              <Alert className="mb-6 border-green-500 bg-green-50 text-green-800 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                  <AlertDescription className="font-medium">Login berhasil! Mengalihkan...</AlertDescription>
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
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
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Link href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">Lupa Password?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Masuk Sekarang
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
                  Daftar di sini
                </Link>
              </p>
               
               <div className="pt-4 border-t border-gray-100 flex justify-center gap-4 text-xs font-medium text-gray-500">
                  <Link href="/agent/register" className="hover:text-blue-600 transition-colors">Daftar Agen</Link>
                  <span>•</span>
                  <Link href="/" className="hover:text-blue-600 transition-colors">Kembali ke Beranda</Link>
               </div>
            </div>
            
             {/* Quick Login Demo (for development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 text-center font-bold">Quick Login (Dev)</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => {
                      setFormData({ email: "admin@maytravel.com", password: "password123" });
                    }}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                     variant="ghost"
                    size="sm"
                     className="h-7 text-xs bg-purple-50 text-purple-600 hover:bg-purple-100"
                    onClick={() => {
                      setFormData({ email: "jaya.travel@example.com", password: "password123" });
                    }}
                  >
                    Agent
                  </Button>
                  <Button
                    type="button"
                     variant="ghost"
                    size="sm"
                     className="h-7 text-xs bg-green-50 text-green-600 hover:bg-green-100"
                    onClick={() => {
                      setFormData({ email: "user@example.com", password: "password123" });
                    }}
                  >
                    User
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
