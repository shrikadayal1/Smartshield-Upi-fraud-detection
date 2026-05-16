import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ss_token')
      localStorage.removeItem('ss_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const assessmentService = {
  predict: (payload) => api.post('/predict', payload).then((r) => r.data),
}

export const verifyService = {
  scanQR: (filename, file_size_kb) =>
    api.post('/verify/qr', { filename, file_size_kb }).then((r) => r.data),
  verifyScreenshot: (filename, file_size_kb) =>
    api.post('/verify/screenshot', { filename, file_size_kb }).then((r) => r.data),
}

export const statsService = {
  summary: () => api.get('/stats/summary').then((r) => r.data),
}

export default api
