import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

// Products API
export const productsAPI = {
  getAll: (filters = {}) => api.get('/products', { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => {
    const formData = new FormData()
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        productData.images.forEach(image => formData.append('images', image))
      } else {
        formData.append(key, productData[key])
      }
    })
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  update: (id, productData) => {
    const formData = new FormData()
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        productData.images.forEach(image => {
          if (image instanceof File) {
            formData.append('images', image)
          }
        })
      } else {
        formData.append(key, productData[key])
      }
    })
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  delete: (id) => api.delete(`/products/${id}`),
}

// Chat API
export const chatAPI = {
  getMessages: (room) => api.get(`/chat/${room}`),
  sendMessage: (messageData) => api.post('/chat', messageData),
}