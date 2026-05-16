import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button, AlertBanner } from '../components/UI'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const { login, loading }      = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    const result = await login(email, password)
    if (result.ok) navigate('/dashboard')
    else setError(result.message)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>SmartShield</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.1em', marginTop: 3 }}>SECURE TRANSACTION MONITORING</div>
      </div>

      <div style={{ width: 380, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 36, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Sign in</h1>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>Access your monitoring dashboard</p>
        </div>

        <AlertBanner message={error} type="error" onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter password" required />
          <div style={{ textAlign: 'right', marginBottom: 22, marginTop: -8 }}>
            <span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>Forgot password?</span>
          </div>
          <Button onClick={handleSubmit} loading={loading} style={{ width: '100%' }}>Sign In</Button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'var(--text-sub)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
        </div>
      </div>

      <div style={{ marginTop: 36, fontSize: 11, color: 'var(--text-mute)' }}>
        Secure Transaction Monitoring System · SmartShield Technologies
      </div>
    </div>
  )
}
