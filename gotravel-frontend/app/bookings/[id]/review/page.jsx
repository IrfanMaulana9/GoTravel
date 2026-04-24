"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { bookingAPI, reviewAPI, formatPrice } from "@/lib/api"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Star, Loader2 } from "lucide-react"

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (params.id) {
      fetchBookingDetail()
    }
  }, [params.id, isAuthenticated, authLoading, router])

  const fetchBookingDetail = async () => {
    setLoading(true)
    try {
      const response = await bookingAPI.getById(params.id)
      if (response.success) {
        setBooking(response.data)
        if (response.data.review) {
          toast.info("Anda sudah memberikan review untuk booking ini")
          router.push(`/bookings/${params.id}`)
        }
      } else {
        toast.error(response.message || "Gagal memuat detail booking")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching booking detail:", error)
      toast.error(error.response?.data?.message || "Gagal memuat detail booking")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Rating harus antara 1-5")
      return
    }

    setSubmitting(true)
    try {
      const response = await reviewAPI.create({
        booking_id: booking.id,
        rating: formData.rating,
        comment: formData.comment,
      })

      if (response.success) {
        toast.success("Review berhasil dikirim!")
        router.push(`/bookings/${booking.id}`)
      } else {
        toast.error(response.message || "Gagal mengirim review")
      }
    } catch (error) {
      console.error("Error creating review:", error)
      toast.error(error.response?.data?.message || "Gagal mengirim review")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data booking...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/bookings/${booking.id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Detail Booking
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Beri Review & Rating</CardTitle>
            <CardDescription>
              Bagikan pengalaman perjalanan Anda dengan {booking.travel?.agent_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Booking Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold mb-1">
                {booking.travel?.from_city} → {booking.travel?.to_city}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(booking.travel_date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="text-base font-medium mb-3 block">Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating }))}
                      className={`p-2 rounded-lg transition-all ${
                        formData.rating >= rating
                          ? "bg-yellow-100 text-yellow-500"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          formData.rating >= rating ? "fill-yellow-500" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {formData.rating === 5 && "Sangat Puas"}
                  {formData.rating === 4 && "Puas"}
                  {formData.rating === 3 && "Cukup"}
                  {formData.rating === 2 && "Kurang Puas"}
                  {formData.rating === 1 && "Tidak Puas"}
                </p>
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment" className="text-base font-medium mb-3 block">
                  Ulasan (Opsional)
                </Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={5}
                  placeholder="Bagikan pengalaman perjalanan Anda..."
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Link href={`/bookings/${booking.id}`} className="flex-1">
                  <Button variant="outline" type="button" className="w-full">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Kirim Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

