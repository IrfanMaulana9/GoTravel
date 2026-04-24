"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { travelAPI, reviewAPI, formatPrice, formatTime } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Clock, Users, Star, ArrowLeft, ArrowRight, Loader2, Calendar, Shield, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function TravelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [travel, setTravel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (params.id) {
      fetchTravelDetail();
      fetchReviews();
    }
  }, [params.id, isAuthenticated, authLoading, router]);

  const fetchTravelDetail = async () => {
    setLoading(true);
    try {
      const response = await travelAPI.getById(params.id);

      if (response.success) {
        setTravel(response.data);
      } else {
        toast.error(response.message || "Gagal memuat detail travel");
        router.push("/travels");
      }
    } catch (error) {
      console.error("Error fetching travel detail:", error);
      toast.error(error.response?.data?.message || "Gagal memuat detail travel");
      router.push("/travels");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await reviewAPI.getAll({ travel_id: params.id });
      if (response.success) {
        // API returns paginated data, so we get the items from data property
        setReviews(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!travel) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="bg-blue-600 pb-32 pt-12">
        <div className="container mx-auto px-4">
          <Link href="/travels" className="inline-flex items-center text-blue-100 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Pencarian
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/20 backdrop-blur-sm">{travel.type}</Badge>
                <div className="flex items-center gap-1 text-yellow-300">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{travel.rating || 4.8}</span>
                  <span className="text-white/70 text-sm">({travel.reviews_count || 50} Review)</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{travel.agent_name}</h1>
              <div className="flex items-center text-blue-100 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{travel.from_city}</span>
                <ArrowRight className="w-5 h-5 mx-3" />
                <span>{travel.to_city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image & Key Info */}

            {/* Schedule Info */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Jadwal Perjalanan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                  {/* Departure */}
                  <div className="text-center md:text-left flex-1 relative z-10">
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Berangkat</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{formatTime(travel.depart_time)}</p>
                    <p className="text-gray-600 font-medium">{travel.from_city}</p>
                    <p className="text-sm text-gray-500 mt-1">Terminal Keberangkatan</p>
                  </div>

                  {/* Duration Indicator */}
                  <div className="flex-1 w-full flex flex-col items-center justify-center">
                    <div className="w-full h-0.5 bg-gray-200 relative mb-2">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600"></div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600"></div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 px-2 text-gray-400">
                        <Car className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">{travel.duration}</p>
                  </div>

                  {/* Arrival */}
                  <div className="text-center md:text-right flex-1 relative z-10">
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Tiba</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{formatTime(travel.arrival_time)}</p>
                    <p className="text-gray-600 font-medium">{travel.to_city}</p>
                    <p className="text-sm text-gray-500 mt-1">Titik Penurunan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description & Facilities */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Fasilitas</CardTitle>
                </CardHeader>
                <CardContent>
                  {travel.facilities_array && travel.facilities_array.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {travel.facilities_array.map((facility, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">{facility}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Tidak ada info fasilitas.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Tentang Travel Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {travel.description || "Agen travel ini belum memberikan deskripsi lengkap. Namun, kami menjamin keamanan dan kenyamanan setiap perjalanan yang Anda pesan melalui GoTravel."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Rating & Reviews Section */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    Rating & Review
                  </CardTitle>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-lg text-gray-900">{travel.rating || 0}</span>
                    <span className="text-gray-500 text-sm">({travel.reviews_count || 0})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {reviewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, index) => (
                                <Star key={index} className={`w-4 h-4 ${index < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 fill-gray-300"}`} />
                              ))}
                              <span className="text-sm text-gray-500 ml-2">
                                {new Date(review.created_at).toLocaleDateString("id-ID", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {review.rating}.0
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Belum ada review</p>
                    <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama memberikan review untuk travel ini</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-2xl border-0 overflow-hidden rounded-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
                  <p className="text-blue-100 text-sm font-medium mb-1">Harga Terbaik</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm align-top mt-1">Rp</span>
                    <span className="text-5xl font-bold tracking-tight">{travel.price.toLocaleString("id-ID")}</span>
                  </div>
                  <p className="text-blue-100 text-sm mt-2">per penumpang</p>
                </div>

                <CardContent className="pt-8 px-6 pb-8 space-y-6">
                  <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold text-sm">Kursi Tersedia</span>
                    </div>
                    <span className="font-bold text-lg">{travel.available_seats || travel.seats}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span>Garansi Keamanan</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span>Reschedule Tersedia</span>
                    </div>
                  </div>

                  <Link href={`/travels/${travel.id}/book`} className="block w-full">
                    <Button className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 rounded-xl" disabled={travel.available_seats <= 0}>
                      {travel.available_seats > 0 ? "Pilih Kursi" : "Habis Terjual"}
                    </Button>
                  </Link>

                  <p className="text-xs text-center text-gray-400">Tidak ada biaya tambahan tersembunyi.</p>
                </CardContent>
              </Card>

              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">i</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">Pastikan Anda tiba di titik penjemputan minimal 30 menit sebelum keberangkatan untuk proses check-in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
