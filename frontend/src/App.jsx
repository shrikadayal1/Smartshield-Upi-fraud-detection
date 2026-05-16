import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AppLayout from './components/AppLayout'
import Login            from './pages/Login'
import Signup           from './pages/Signup'
import Dashboard        from './pages/Dashboard'
import Assessment       from './pages/Assessment'
import VisualVerification from './pages/VisualVerification'
import Monitoring       from './pages/Monitoring'
import Analytics        from './pages/Analytics'
import Explainability   from './pages/Explainability'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/assessment"   element={<Assessment />} />
            <Route path="/verification" element={<VisualVerification />} />
            <Route path="/monitoring"   element={<Monitoring />} />
            <Route path="/analytics"    element={<Analytics />} />
            <Route path="/explainability" element={<Explainability />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
