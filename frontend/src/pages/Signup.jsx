import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button, AlertBanner } from '../components/UI'

export default function Signup() {
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const { signup, loading } = useAuth()
  const navigate = useNavigate()

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())          e.name     = 'Full name is required'
    if (!form.email)                e.email    = 'Email address is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password)             e.password = 'Password is required'
    if (form.password.length < 6)  e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const e2 = validate()
    setErrors(e2)
    if (Object.keys(e2).length) return
    setApiError('')
    const result = await signup(form.name.trim(), form.email, form.password)
    if (result.ok) navigate('/dashboard')
    else setApiError(result.message)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>SmartShield</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.1em', marginTop: 3 }}>SECURE TRANSACTION MONITORING</div>
      </div>

      <div style={{ width: 400, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 36, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Create account</h1>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>Set up your monitoring workspace</p>
        </div>

        <AlertBanner message={apiError} type="error" onClose={() => setApiError('')} />

        <form onSubmit={handleSubmit}>
          <Input label="Full name" value={form.name} onChange={set('name')} placeholder="Your full name" error={errors.name} required />
          <Input label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" error={errors.email} required />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" error={errors.password} required />
          <Input label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" error={errors.confirm} required />
          <Button onClick={handleSubmit} loading={loading} style={{ width: '100%', marginTop: 4 }}>Create Account</Button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'var(--text-sub)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>

      <div style={{ marginTop: 36, fontSize: 11, color: 'var(--text-mute)' }}>
        Secure Transaction Monitoring System · SmartShield Technologies
      </div>
    </div>
  )
}
