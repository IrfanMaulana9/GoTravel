import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata = {
  title: "GoTravel - Platform Travel Agent Terpercaya",
  description:
    "Platform travel agent terpercaya yang menghubungkan penumpang dengan agen travel berkualitas di seluruh Indonesia. Booking mudah, harga transparan, pickup location dengan map.",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
