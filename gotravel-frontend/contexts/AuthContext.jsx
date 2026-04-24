"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI, getCurrentUser, isAuthenticated } from "@/lib/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            // Optionally verify token is still valid
            try {
              const response = await authAPI.getMe()
              if (response.success && response.user) {
                setUser(response.user)
                localStorage.setItem("user", JSON.stringify(response.user))
              }
            } catch (error) {
              // Token might be invalid, clear auth
              localStorage.removeItem("token")
              localStorage.removeItem("user")
              setUser(null)
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      console.log("🔵 AuthContext: Starting login...")
      console.log("🔵 AuthContext: Email:", email)
      
      const response = await authAPI.login(email, password)

      // Debug logging
      console.log("🟢 AuthContext: Raw response:", response)
      console.log("🟢 AuthContext: Response type:", typeof response)
      console.log("🟢 AuthContext: Response.success:", response?.success)
      console.log("🟢 AuthContext: Response.user:", response?.user)

      // Handle different response formats
      if (response) {
        // Check if response has success property
        if (response.success === true || response.success === "true") {
          // Check if user data exists
          if (response.user) {
            console.log("✅ AuthContext: Login successful, setting user:", response.user)
            setUser(response.user)
            // Also update localStorage user
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(response.user))
            }
            return { success: true, user: response.user }
          } else if (response.data && response.data.user) {
            // Fallback: check in response.data
            console.log("✅ AuthContext: Login successful (data.user):", response.data.user)
            setUser(response.data.user)
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(response.data.user))
            }
            return { success: true, user: response.data.user }
          } else {
            console.error("❌ AuthContext: Response success but no user data:", response)
            return { 
              success: false, 
              message: response.message || "Data user tidak ditemukan dalam response" 
            }
          }
        } else {
          console.error("❌ AuthContext: Response not successful:", response)
          return { 
            success: false, 
            message: response?.message || "Login gagal. Silakan coba lagi." 
          }
        }
      }

      console.error("❌ AuthContext: No response received")
      return { 
        success: false, 
        message: "Tidak ada response dari server. Silakan coba lagi." 
      }
    } catch (error) {
      console.error("Login error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error response:", error.response)
      console.error("Is Network Error:", error.isNetworkError)
      
      // Handle network errors (no response from server)
      if (error.isNetworkError || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        return {
          success: false,
          message: `Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan di http://localhost:8000. Error: ${error.message || 'Connection refused'}`,
        }
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          success: false,
          message: "Request timeout. Server tidak merespons. Pastikan backend berjalan.",
        }
      }
      
      // Handle server errors (with response)
      if (error.response) {
        const errorData = error.response.data
        const status = error.response.status
        
        if (status === 401) {
          return {
            success: false,
            message: errorData?.message || "Email atau password salah",
          }
        }
        
        if (status === 422) {
          return {
            success: false,
            message: errorData?.message || "Validasi gagal",
            errors: errorData?.errors,
          }
        }
        
        if (status >= 500) {
          return {
            success: false,
            message: "Server error. Silakan coba lagi nanti.",
          }
        }
        
        return {
          success: false,
          message: errorData?.message || errorData?.error || "Login gagal. Silakan coba lagi.",
        }
      }
      
      // Handle other errors
      return {
        success: false,
        message: error.message || "Login gagal. Silakan coba lagi.",
      }
    }
  }

  const register = async (data) => {
    try {
      const response = await authAPI.register(data)
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registrasi gagal",
        errors: error.response?.data?.errors,
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
