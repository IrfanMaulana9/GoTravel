// API Configuration and Axios Setup
import axios from "axios"

// Base URL untuk Laravel backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Axios instance dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor - menambahkan JWT token ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handle error dan auto logout jika token expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// ==================== AUTH API ====================

export const authAPI = {
  // Register user baru
  register: async (data) => {
    const response = await apiClient.post("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    })
    return response.data
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log("🔵 API: Attempting login to:", API_BASE_URL + "/auth/login")
      console.log("🔵 API: Request payload:", { email, password: "***" })
      
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      })

      console.log("🟢 API: Full response:", response)
      console.log("🟢 API: Response status:", response.status)
      console.log("🟢 API: Response data:", response.data)
      console.log("🟢 API: Response data type:", typeof response.data)
      console.log("🟢 API: Response.data.success:", response.data?.success)
      console.log("🟢 API: Response.data.user:", response.data?.user)
      console.log("🟢 API: Response.data.access_token:", response.data?.access_token ? "Present" : "Missing")

      const responseData = response.data

      // Validate response structure
      if (!responseData) {
        console.error("❌ API: No response data")
        throw new Error("Tidak ada data response dari server")
      }

      // Simpan token dan user data ke localStorage
      if (responseData.success) {
        if (responseData.access_token) {
          localStorage.setItem("token", responseData.access_token)
          console.log("✅ API: Token saved to localStorage")
        } else {
          console.warn("⚠️ API: No access_token in response")
        }
        
        if (responseData.user) {
          localStorage.setItem("user", JSON.stringify(responseData.user))
          console.log("✅ API: User data saved to localStorage:", responseData.user)
        } else {
          console.warn("⚠️ API: No user data in response")
        }
      }

      // Return the response data
      console.log("✅ API: Returning response data:", responseData)
      return responseData
    } catch (error) {
      console.error("API Login error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error response:", error.response)
      
      // Handle network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        const networkError = new Error("Tidak dapat terhubung ke server. Pastikan backend berjalan di " + API_BASE_URL)
        networkError.isNetworkError = true
        networkError.originalError = error
        throw networkError
      }
      
      throw error
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post("/auth/logout")
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  // Get current user info
  getMe: async () => {
    const response = await apiClient.get("/auth/me")
    return response.data
  },

  registerAgent: async (data) => {
    const formData = new FormData()
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })

    const response = await apiClient.post("/auth/register-agent", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}

// ==================== TRAVEL API ====================

export const travelAPI = {
  // Get semua travel dengan filter dan pagination
  getAll: async (params = {}) => {
    const response = await apiClient.get("/travels", { params })
    return response.data
  },

  // Search travel (alias untuk getAll dengan query params)
  search: async (filters) => {
    const response = await apiClient.get("/v1/travels/search", { params: filters })
    return response.data
  },

  // Get detail travel by ID
  getById: async (id) => {
    const response = await apiClient.get(`/travels/${id}`)
    return response.data
  },

  // Get daftar kota yang tersedia
  getCities: async () => {
    const response = await apiClient.get("/travels/cities")
    return response.data
  },

  // Create travel baru (requires auth)
  create: async (data) => {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === "facilities" && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      }
    })

    const response = await apiClient.post("/travels", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Update travel (requires auth)
  update: async (id, data) => {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === "facilities" && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]))
        } else {
          formData.append(key, data[key])
        }
      }
    })

    const response = await apiClient.post(`/travels/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-HTTP-Method-Override": "PATCH",
      },
    })
    return response.data
  },

  // Delete travel (requires auth)
  delete: async (id) => {
    const response = await apiClient.delete(`/travels/${id}`)
    return response.data
  },

  addPickupLocation: async (travelId, locationData) => {
    const response = await apiClient.post(`/travels/${travelId}/pickup-locations`, locationData)
    return response.data
  },

  getPickupLocations: async (travelId) => {
    const response = await apiClient.get(`/travels/${travelId}/pickup-locations`)
    return response.data
  },

  deletePickupLocation: async (travelId, locationId) => {
    const response = await apiClient.delete(`/travels/${travelId}/pickup-locations/${locationId}`)
    return response.data
  },
}

export const bookingAPI = {
  create: async (data) => {
    const response = await apiClient.post("/bookings", data)
    return response.data
  },

  getAll: async (params = {}) => {
    const response = await apiClient.get("/bookings", { params })
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status })
    return response.data
  },

  cancel: async (id) => {
    const response = await apiClient.delete(`/bookings/${id}`)
    return response.data
  },
}

export const reviewAPI = {
  create: async (data) => {
    const response = await apiClient.post("/reviews", data)
    return response.data
  },

  getAll: async (params = {}) => {
    const response = await apiClient.get("/reviews", { params })
    return response.data
  },
}

export const agentAPI = {
  getStats: async () => {
    const response = await apiClient.get("/agent/stats")
    return response.data
  },

  getTravels: async (params = {}) => {
    const response = await apiClient.get("/agent/travels", { params })
    return response.data
  },

  getBookings: async (params = {}) => {
    const response = await apiClient.get("/agent/bookings", { params })
    return response.data
  },
}

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await apiClient.get("/admin/stats")
    return response.data
  },

  getAllUsers: async (params = {}) => {
    const response = await apiClient.get("/admin/users", { params })
    return response.data
  },

  getAllAgents: async (params = {}) => {
    const response = await apiClient.get("/admin/agents", { params })
    return response.data
  },

  getAllBookings: async (params = {}) => {
    const response = await apiClient.get("/admin/bookings", { params })
    return response.data
  },

  updateUserStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status })
    return response.data
  },

  updateAgentStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/agents/${id}/status`, { status })
    return response.data
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`)
    return response.data
  },
}

// ==================== HELPER FUNCTIONS ====================

export const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price)
}

export const formatTime = (time) => {
  if (!time) return ""
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getImageUrl = (path) => {
  if (!path) return "/placeholder.svg"
  if (path.startsWith("http")) return path

  // Laravel storage URL
  const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8000/storage"
  return `${storageBaseUrl}/${path}`
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token")
}

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

export default apiClient
