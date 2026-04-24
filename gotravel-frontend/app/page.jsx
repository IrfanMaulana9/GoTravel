"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Bus, Search, Shield, Clock, Users, Star, MapPin, Phone, Mail, ChevronDown, Car, ArrowRight } from "lucide-react"
import WeatherWidget from "@/components/WeatherWidget"

import { Menu, X } from "lucide-react"

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-2xl font-bold tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}
              >
                GoTravel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {['Beranda', 'Fitur', 'Tentang', 'Kontak'].map((item) => (
                 <a
                  key={item}
                  href={`#${item.toLowerCase() === 'beranda' ? 'home' : item.toLowerCase()}`}
                  className={`text-sm font-medium transition-colors hover:text-blue-500 ${scrolled ? "text-slate-600" : "text-white/90"}`}
                >
                  {item}
                </a>
              ))}

              {isAuthenticated ? (
                <Link
                  href={
                    user?.role === "admin"
                      ? "/admin/dashboard"
                      : user?.role === "agent"
                        ? "/agent/dashboard"
                        : "/dashboard"
                  }
                >
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-full px-6">
                    <Users className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="ghost" className={scrolled ? "text-slate-600 hover:text-blue-600" : "text-white hover:bg-white/10 hover:text-white"}>
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg px-6 rounded-full font-semibold">
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className={scrolled ? "text-slate-900" : "text-white"}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t md:hidden animate-in slide-in-from-top-2 p-4 flex flex-col gap-4">
                {['Beranda', 'Fitur', 'Tentang', 'Kontak'].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase() === 'beranda' ? 'home' : item.toLowerCase()}`}
                        className="text-sm font-medium text-slate-600 hover:text-blue-600 py-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {item}
                    </a>
                ))}
                 {isAuthenticated ? (
                    <Link
                        href={
                            user?.role === "admin"
                            ? "/admin/dashboard"
                            : user?.role === "agent"
                                ? "/agent/dashboard"
                                : "/dashboard"
                        }
                    >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-lg justify-start">
                             <Users className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                ) : (
                    <div className="flex flex-col gap-3">
                         <Link href="/login">
                            <Button variant="ghost" className="w-full justify-start">
                                Masuk
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 justify-start">
                                Daftar
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-blue-600">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-90"></div>
           <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-black/10 to-transparent"></div>
           
           {/* Abstract Shapes */}
           <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="text-white space-y-8 animate-in slide-in-from-left duration-700 fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-blue-50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Platform Travel Terpercaya #1 di Indonesia
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                Jelajahi Dunia dengan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                  Cara Baru
                </span>
              </h1>
              
              <p className="text-lg text-blue-100 leading-relaxed max-w-lg">
                Temukan pengalaman perjalanan terbaik dengan ribuan pilihan armada travel yang aman, nyaman, dan terjangkau untuk setiap tujuan Anda.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                {isAuthenticated ? (
                  <Link href="/travels">
                    <Button size="lg" className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20 rounded-full transition-all hover:scale-105">
                      <Search className="w-5 h-5 mr-2" />
                      Cari Tiket Travel
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20 rounded-full transition-all hover:scale-105">
                        Mulai Sekarang
                      </Button>
                    </Link>
                    <Link href="/agent/register">
                       <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white/30 text-white hover:bg-white/10 hover:text-white rounded-full backdrop-blur-sm">
                        Jadi Mitra Agen
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-white/10">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-blue-600 bg-gray-200 flex items-center justify-center overflow-hidden z-[${5-i}]`}>
                           <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                    ))}
                 </div>
                 <div>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-sm text-blue-100 mt-1"><span className="font-bold text-white">4.9/5</span> dari 2,000+ review</p>
                 </div>
              </div>
            </div>

            {/* Hero Image / Illustration */}
            <div className="hidden lg:block relative animate-in slide-in-from-right duration-700 fade-in delay-200">
                <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-inner p-1">
                        <img 
                           src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
                           alt="Travel Bus" 
                           className="w-full h-[400px] object-cover rounded-xl hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    
                    {/* Floating Cards */}
                    <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Status</p>
                            <p className="text-sm font-bold text-gray-900">Terverifikasi Aman</p>
                        </div>
                    </div>

                     <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Rute Populer</p>
                            <p className="text-sm font-bold text-gray-900">Jakarta - Bandung</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="about" className="py-12 bg-white relative z-20 -mt-10 container mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                { number: "150+", label: "Mitra Travel", icon: Bus },
                { number: "50+", label: "Kota Tujuan", icon: MapPin },
                { number: "5000+", label: "Pelanggan Happy", icon: Users },
                { number: "24/7", label: "Support", icon: Clock },
            ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-2 group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stat.number}</h3>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Kenapa Memilih Kami?</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Solusi Perjalanan Modern untuk Anda
            </h3>
            <p className="text-gray-600 text-lg">
              Kami menghadirkan fitur-fitur terbaik untuk memastikan perjalanan Anda tidak hanya sampai tujuan, tapi juga menyenangkan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Booking Instan", desc: "Pesan tiket dalam hitungan detik, konfirmasi otomatis masuk ke email Anda.", icon: Clock, color: "bg-orange-500" },
              { title: "Pembayaran Aman", desc: "Didukung bebagai metode pembayaran terpercaya dengan enkripsi keamanan tinggi.", icon: Shield, color: "bg-green-500" },
              { title: "Harga Terbaik", desc: "Jaminan harga kompetitif tanpa biaya tersembunyi. Hemat lebih banyak!", icon: Car, color: "bg-blue-500" },
              { title: "Tracking Armada", desc: "Pantau lokasi penjemputan armada travel Anda secara real-time.", icon: MapPin, color: "bg-purple-500" },
              { title: "Customer Care", desc: "Tim support kami siap membantu kendala perjalanan Anda 24 jam non-stop.", icon: Phone, color: "bg-red-500" },
              { title: "Review Asli", desc: "Baca ulasan asli dari pengguna lain sebelum memilih agen travel Anda.", icon: Star, color: "bg-yellow-500" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-14 h-14 ${feature.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                   <feature.icon className={`w-7 h-7 text-${feature.color.split('-')[1]}-600`} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h4>
                <p className="text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-slate-900 text-white">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-10 fixed-bg"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60"></div>
         
         <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Siap untuk Petualangan Berikutnya?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                Bergabunglah dengan GoTravel sekarang dan temukan kemudahan dalam setiap perjalanan Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/travels">
                  <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-full">
                    Cari Tiket Sekarang
                  </Button>
               </Link>
               {!isAuthenticated && (
                   <Link href="/register">
                      <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/20 text-white hover:bg-white/10 rounded-full">
                        Buat Akun Gratis
                      </Button>
                   </Link>
               )}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">GoTravel</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Platform travel agent terpercaya yang menghubungkan penumpang dengan agen travel berkualitas. Aman, Cepat, dan Nyaman.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Navigasi</h5>
              <div className="space-y-4">
                <a href="#home" className="block hover:text-blue-500 transition-colors">Beranda</a>
                <a href="#features" className="block hover:text-blue-500 transition-colors">Fitur Unggulan</a>
                <Link href="/travels" className="block hover:text-blue-500 transition-colors">Cari Tiket</Link>
                <Link href="/agent/register" className="block hover:text-blue-500 transition-colors">Partner Agen</Link>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Hubungi Kami</h5>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-blue-500 mt-1" />
                  <span>+62 812-3456-7890<br/><span className="text-sm text-slate-500">Senin - Jumat, 09:00 - 17:00</span></span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>help@gotravel.com</span>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                  <span>Jl. Sudirman No. 45<br/>Jakarta Selatan, Indonesia</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Ikuti Kami</h5>
              <div className="flex gap-4">
                {['Facebook', 'Twitter', 'Instagram'].map(social => (
                    <a key={social} href="#" className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                        <span className="sr-only">{social}</span>
                        {social[0]}
                    </a>
                ))}
              </div>
              <div className="mt-8 text-sm">
                  <p>Berlangganan Newsletter</p>
                  <div className="flex gap-2 mt-2">
                      <input type="email" placeholder="Email Anda" className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-600" />
                      <button className="bg-blue-600 text-white rounded-lg px-3 py-2"><ArrowRight className="w-4 h-4" /></button>
                  </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; 2025 GoTravel Indonesia. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-blue-500">Privacy Policy</a>
                <a href="#" className="hover:text-blue-500">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
