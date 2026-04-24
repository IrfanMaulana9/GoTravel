"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, CloudLightning, Wind, Droplets, Clock, CheckCircle, AlertCircle } from "lucide-react"

const CITIES = [
  { name: "Jakarta", lat: -6.1751, lng: 106.8650 },
  { name: "Bandung", lat: -6.9175, lng: 107.6191 },
  { name: "Surabaya", lat: -7.2575, lng: 112.7521 },
  { name: "Malang", lat: -7.9666, lng: 112.6326 },
  { name: "Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { name: "Solo", lat: -7.5666, lng: 110.8297 },
  { name: "Medan", lat: 3.5952, lng: 98.6722 },
  { name: "Semarang", lat: -6.9667, lng: 110.4167 },
]

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lats = CITIES.map(c => c.lat).join(",")
        const lngs = CITIES.map(c => c.lng).join(",")
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`
        )
        const data = await response.json()
        
        // Data format from open-meteo for multiple locations is an array of objects
        const results = Array.isArray(data) ? data : [data]
        
        const formattedData = results.map((result, index) => {
          const current = result.current
          return {
            city: CITIES[index].name,
            temp: Math.round(current.temperature_2m),
            humidity: current.relative_humidity_2m,
            wind: current.wind_speed_10m,
            code: current.weather_code,
            condition: getWeatherCondition(current.weather_code),
            status: getTripStatus(current.weather_code)
          }
        })

        setWeatherData(formattedData)
      } catch (error) {
        console.error("Error fetching weather:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const getWeatherCondition = (code) => {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return { label: "Cerah", icon: Sun, color: "text-yellow-500" }
    if (code >= 1 && code <= 3) return { label: "Berawan/Mendung", icon: Cloud, color: "text-gray-500" }
    if (code >= 45 && code <= 48) return { label: "Berkabut", icon: Cloud, color: "text-gray-400" }
    if (code >= 51 && code <= 55) return { label: "Gerimis", icon: CloudRain, color: "text-blue-400" }
    if (code >= 61 && code <= 65) return { label: "Hujan", icon: CloudRain, color: "text-blue-500" }
    if (code >= 80 && code <= 82) return { label: "Hujan Deras", icon: CloudRain, color: "text-blue-600" }
    if (code >= 95) return { label: "Badai Petir", icon: CloudLightning, color: "text-purple-500" }
    return { label: "Berawan", icon: Cloud, color: "text-gray-500" }
  }

  const getTripStatus = (code) => {
    if (code <= 3) {
      return { 
        text: "Penjemputan Lancar", 
        color: "text-green-600", 
        bgColor: "bg-green-50",
        icon: CheckCircle,
        delay: false 
      }
    }
    if (code >= 51) {
      // Logic for delay simulation based on "rain"
      const delayMinutes = code >= 61 ? 20 : 10;
      return { 
        text: `Penjemputan Delay ${delayMinutes} menit`, 
        color: "text-orange-600", 
        bgColor: "bg-orange-50",
        icon: Clock,
        delay: true
      }
    }
    return { 
      text: "Penjemputan Lancar", 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      icon: CheckCircle,
      delay: false
    }
  }

  if (loading) return <div className="py-10 text-center">Memuat data cuaca...</div>

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Cuaca di Kota Tujuan</h2>
          <p className="text-slate-500">Cek kondisi cuaca sebelum memulai perjalanan Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {weatherData.map((data, index) => {
            const ConditionIcon = data.condition.icon
            const StatusIcon = data.status.icon
            
            return (
              <Card key={index} className="border hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{data.city}</h3>
                      <p className="text-xs text-slate-500">Kondisi Cuaca</p>
                    </div>
                    <ConditionIcon className={`w-10 h-10 ${data.condition.color}`} />
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-1">{data.temp}°C</div>
                    <div className="text-sm font-medium text-slate-600">{data.condition.label}</div>
                  </div>

                  <div className="flex justify-between items-center mb-6 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs mb-1">Kelembaban</p>
                      <div className="flex items-center justify-center gap-1 font-semibold text-slate-700">
                         {/* <Droplets className="w-3 h-3" /> */}
                         {data.humidity}%
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs mb-1">Angin</p>
                      <div className="flex items-center justify-center gap-1 font-semibold text-slate-700">
                         {/* <Wind className="w-3 h-3" /> */}
                         {data.wind} km/h
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg p-3 flex items-center gap-3 ${data.status.bgColor}`}>
                    <StatusIcon className={`w-5 h-5 ${data.status.color}`} />
                    <div>
                      <p className={`text-xs text-slate-500 font-medium`}>Status Penjemputan</p>
                      <p className={`text-sm font-bold ${data.status.color}`}>{data.status.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
