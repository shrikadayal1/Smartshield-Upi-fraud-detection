import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ss_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const saveSession = (token, userData) => {
    localStorage.setItem('ss_token', token)
    localStorage.setItem('ss_user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await authService.login(email, password)
      saveSession(data.access_token, data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.detail || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    try {
      const data = await authService.signup(name, email, password)
      saveSession(data.access_token, data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.detail || 'Signup failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('ss_token')
    localStorage.removeItem('ss_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
