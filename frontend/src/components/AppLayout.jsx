import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { LiveDot } from './UI'

export default function AppLayout() {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '12px 28px', display: 'flex', justifyContent: 'flex-end',
          alignItems: 'center', gap: 20, flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>{today}</span>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <LiveDot />
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{
          padding: '9px 28px', background: 'var(--surface)',
          borderTop: '1px solid var(--border)', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>Secure Transaction Monitoring System</span>
          <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>SmartShield Technologies — v2.4.1</span>
        </footer>
      </div>
    </div>
  )
}
