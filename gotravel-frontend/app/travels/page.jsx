"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { travelAPI, formatPrice, formatTime } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, Search, MapPin, Clock, Users, Star, ArrowRight, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function TravelsPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const [travels, setTravels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    from_city: "",
    to_city: "",
    type: "",
    min_price: "",
    max_price: "",
    sort_by: "created_at",
    order_by: "desc",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 10,
  });

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      fetchCities();
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Reset to page 1 when filters change
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      fetchTravels(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isAuthenticated]);

  const fetchCities = async () => {
    try {
      const response = await travelAPI.getCities();
      if (response.success) {
        setCities(response.data.all_cities || []);
      } else {
        toast.error("Gagal memuat daftar kota");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Gagal memuat daftar kota");
    }
  };

  const fetchTravels = async (page = 1) => {
    setLoading(true);
    try {
      // Clean filters - convert special values to empty strings
      const cleanedFilters = {
        search: filters.search || "",
        from_city: filters.from_city === "all_cities" ? "" : filters.from_city || "",
        to_city: filters.to_city === "all_cities" ? "" : filters.to_city || "",
        type: filters.type === "all_types" ? "" : filters.type || "",
        min_price: filters.min_price || "",
        max_price: filters.max_price || "",
        sort_by: filters.sort_by || "created_at",
        order_by: filters.order_by || "desc",
      };

      const params = {
        ...cleanedFilters,
        page,
        limit: 10,
      };

      const response = await travelAPI.getAll(params);

      if (response.success) {
        setTravels(response.data || []);
        setPagination(
          response.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            per_page: 10,
          }
        );
      } else {
        toast.error(response.message || "Gagal memuat data travel");
      }
    } catch (error) {
      console.error("Error fetching travels:", error);
      toast.error(error.response?.data?.message || "Gagal memuat data travel");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    // fetchTravels will be called automatically via useEffect when filters change
    // But we need to reset to page 1
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      from_city: "",
      to_city: "",
      type: "",
      min_price: "",
      max_price: "",
      sort_by: "created_at",
      order_by: "desc",
    });
    // fetchTravels will be called automatically via useEffect when filters change
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      {/* Header / Search Section */}
      <div className="bg-blue-600 pb-24 pt-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Cari Tiket Travel</h1>
          <p className="text-blue-100">Temukan perjalanan nyaman ke berbagai tujuan di Indonesia.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 pb-12">
        {/* Search & Filter Card */}
        <Card className="mb-8 shadow-xl border-0 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white p-6 md:p-8">
            <div className="grid md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-4 lg:col-span-1">
                <Label htmlFor="search" className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Pencarian
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="search" placeholder="Cari nama agen..." value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all h-11" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Dari Kota</Label>
                <Select value={filters.from_city || "all_cities"} onValueChange={(value) => handleFilterChange("from_city", value === "all_cities" ? "" : value)}>
                  <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white">
                    <SelectValue placeholder="Semua Kota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_cities">Semua Kota</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Ke Kota</Label>
                <Select value={filters.to_city || "all_cities"} onValueChange={(value) => handleFilterChange("to_city", value === "all_cities" ? "" : value)}>
                  <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white">
                    <SelectValue placeholder="Semua Kota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_cities">Semua Kota</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="h-11 bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/20">
                Cari Tiket
              </Button>
            </div>

            {/* Advanced Filters Toggle or just show them */}
            <div className="mt-6 pt-6 border-t border-dashed border-gray-200 grid md:grid-cols-4 gap-6">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Tipe Armada</Label>
                <Select value={filters.type || "all_types"} onValueChange={(value) => handleFilterChange("type", value === "all_types" ? "" : value)}>
                  <SelectTrigger className="h-10 text-sm bg-white border-gray-200">
                    <SelectValue placeholder="Semua Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">Semua Tipe</SelectItem>
                    <SelectItem value="Shuttle Car">Shuttle Car</SelectItem>
                    <SelectItem value="Private Car">Private Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Urutkan</Label>
                <Select value={filters.sort_by} onValueChange={(value) => handleFilterChange("sort_by", value)}>
                  <SelectTrigger className="h-10 text-sm bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Terbaru</SelectItem>
                    <SelectItem value="price">Harga</SelectItem>
                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                    <SelectItem value="depart_time">Waktu Berangkat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end justify-end">
                <Button variant="ghost" onClick={handleReset} className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-10">
                  Reset Filter
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 animate-pulse">Sedang mencari travel terbaik...</p>
          </div>
        ) : travels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada travel ditemukan</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Coba ubah filter pencarian Anda atau cari rute lain yang tersedia.</p>
            <Button variant="outline" onClick={handleReset} className="mt-6">
              Reset Semua Filter
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-600 px-1">
              <p>
                Menampilkan <span className="font-bold text-gray-900">{travels.length}</span> dari {pagination.total_items} travel tersedia
              </p>
              <div className="hidden md:flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Live Update</span>
              </div>
            </div>

            <div className="grid gap-6">
              {travels.map((travel, index) => (
                <div
                  key={travel.id}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 md:flex items-center gap-6 animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  {/* Left: Agent Info & Route */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between md:justify-start gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Car className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{travel.agent_name}</h3>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal text-xs">
                            {travel.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-medium">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          <span>{travel.rating || "4.8"}</span>
                          <span className="text-gray-400 font-normal">({travel.reviews_count || 50} ulasan)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-right flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Berangkat</p>
                        <p className="font-bold text-slate-900">{formatTime(travel.depart_time)}</p>
                        <p className="text-xs text-gray-600 truncate max-w-[100px]">{travel.from_city}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center px-2">
                        <p className="text-[10px] text-gray-400 mb-1">2j 30m</p>
                        <div className="w-24 h-0.5 bg-gray-300 relative">
                          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <Car className="w-4 h-4 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-0.5" />
                        </div>
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Tiba</p>
                        <p className="font-bold text-slate-900">{formatTime(travel.arrival_time)}</p>
                        <p className="text-xs text-gray-600 truncate max-w-[100px]">{travel.to_city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Facilities */}
                  <div className="w-px h-32 bg-gray-100 hidden md:block"></div>

                  <div className="md:w-64 py-4 md:py-0 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{travel.available_seats || travel.seats} Kursi Tersedia</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {travel.facilities_array &&
                          travel.facilities_array.slice(0, 3).map((facility, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                              {facility}
                            </span>
                          ))}
                        {travel.facilities_array && travel.facilities_array.length > 3 && <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">+{travel.facilities_array.length - 3}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Action */}
                  <div className="md:w-48 flex flex-col items-center md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 mt-4 md:mt-0">
                    <div className="text-center md:text-right">
                      <p className="text-xs text-gray-500 line-through">Rp {(travel.price * 1.2).toLocaleString()}</p>
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(travel.price)}</p>
                      <p className="text-[10px] text-gray-400">per orang / kursi</p>
                    </div>
                    <Link href={`/travels/${travel.id}`} className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20">Pilih</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-200">
                <Button variant="outline" onClick={() => fetchTravels(pagination.current_page - 1)} disabled={!pagination.has_prev_page}>
                  Sebelumnya
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.total_pages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => fetchTravels(idx + 1)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${pagination.current_page === idx + 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <Button variant="outline" onClick={() => fetchTravels(pagination.current_page + 1)} disabled={!pagination.has_next_page}>
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
