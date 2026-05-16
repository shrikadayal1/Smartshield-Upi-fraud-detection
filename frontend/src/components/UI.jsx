import { useState } from 'react'

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hover = false, className = '' }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className={className}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: hov ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hov ? 'translateY(-1px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── StatusPill ────────────────────────────────────────────────────────────────
export function StatusPill({ status }) {
  const cfg = {
    FLAGGED:  { bg: 'var(--red-bg)',   color: 'var(--red)',   border: 'var(--red-mid)',  label: 'Flagged'      },
    REVIEW:   { bg: 'var(--amber-bg)', color: 'var(--amber)', border: '#F0D5A8',         label: 'Under Review' },
    CLEARED:  { bg: 'var(--green-bg)', color: 'var(--green)', border: 'var(--green-mid)',label: 'Cleared'      },
  }[status] || { bg: '#F5F5F5', color: 'var(--text-sub)', border: 'var(--border)', label: status }

  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

// ── RiskBar ───────────────────────────────────────────────────────────────────
export function RiskBar({ value, style = {} }) {
  const color = value > 65 ? 'var(--red)' : value > 35 ? 'var(--amber)' : 'var(--green)'
  return (
    <div style={style}>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 3, textAlign: 'right' }}>{value}%</div>
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, type = 'text', value, onChange, placeholder, error, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: 6, letterSpacing: '0.02em' }}>
          {label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          background: focused ? '#FAFAFE' : 'var(--surface)',
          fontSize: 14, color: 'var(--text)', outline: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      />
      {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', display: 'block', marginBottom: 6, letterSpacing: '0.02em' }}>
          {label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'var(--bg)',
          fontSize: 14, color: 'var(--text)', outline: 'none', cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, onClick, loading = false, disabled = false, variant = 'primary', style = {} }) {
  const [hov, setHov] = useState(false)
  const variants = {
    primary:   { bg: loading || disabled ? 'var(--border)' : hov ? 'var(--accent-hover)' : 'var(--accent)', color: loading || disabled ? 'var(--text-mute)' : '#fff' },
    secondary: { bg: hov ? 'var(--border)' : 'var(--bg)', color: 'var(--text-sub)', border: '1px solid var(--border)' },
    danger:    { bg: loading || disabled ? 'var(--border)' : hov ? '#A93226' : 'var(--red)', color: '#fff' },
  }
  const v = variants[variant] || variants.primary
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '10px 20px', borderRadius: 'var(--radius-sm)',
        border: v.border || 'none', background: v.bg, color: v.color,
        fontSize: 14, fontWeight: 700, cursor: loading || disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s', letterSpacing: '0.02em', ...style,
      }}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

// ── AlertBanner ───────────────────────────────────────────────────────────────
export function AlertBanner({ message, type = 'error', onClose }) {
  if (!message) return null
  const cfg = {
    error:   { bg: 'var(--red-bg)',   border: 'var(--red-mid)',  color: 'var(--red)',   borderLeft: 'var(--red)'   },
    success: { bg: 'var(--green-bg)', border: 'var(--green-mid)',color: 'var(--green)', borderLeft: 'var(--green)' },
    warn:    { bg: 'var(--amber-bg)', border: '#F0D5A8',         color: 'var(--amber)', borderLeft: 'var(--amber)' },
  }[type]
  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.borderLeft}`, borderRadius: 'var(--radius-sm)',
      padding: '10px 16px', marginBottom: 16, display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: 13, color: cfg.color }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', fontSize: 18 }}>×</button>}
    </div>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 4 }}>{subtitle}</p>}
    </div>
  )
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase' }}>
      {children}
    </div>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar() {
  return (
    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, animation: 'sweep 2s ease-in-out infinite', width: '35%' }} />
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent = 'var(--accent)' }) {
  return (
    <Card hover style={{ padding: '20px 22px', borderLeft: `3px solid ${accent}` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 5 }}>{sub}</div>}
    </Card>
  )
}

// ── LiveDot ───────────────────────────────────────────────────────────────────
export function LiveDot() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'var(--green-bg)', border: '1px solid var(--green-mid)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>Live</span>
    </span>
  )
}
