import axios from 'axios'

// Use environment variable or fallback to your Render URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://agrilink-ai-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
}

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  getFarmers: () => api.get('/users/role/farmers'),
}

// Products API - UPDATED
export const productsAPI = {
  getAll: (filters = {}) => api.get('/products', { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
}

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (room) => api.get(`/messages/${room}`),
  sendMessage: (messageData) => api.post('/messages', messageData),
}

// Analytics API
export const analyticsAPI = {
  getFarmerAnalytics: () => api.get('/analytics/farmer'),
  getBuyerAnalytics: () => api.get('/analytics/buyer'),
}
