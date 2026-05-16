import { useState, useEffect } from 'react'
import { Card, StatusPill, RiskBar, SectionLabel, PageHeader, LiveDot, Button } from '../components/UI'

const NAMES    = ['Ravi Kumar','Priya Sharma','Amit Jain','Sneha Reddy','Kiran Bose','Deepak Mehta','Anita Pillai','Suresh Kamath','Meera Nair','Raj Verma','Pooja Tiwari','Vivek Gupta']
const CITIES   = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow']
const DEVICES  = ['iPhone 15 Pro','Samsung Galaxy S24','OnePlus 12','Pixel 8','Redmi Note 13','Oppo Reno 10']
const TX_TYPES = ['Peer Transfer','Merchant Payment','Utility Bill','Mobile Recharge','Fund Transfer','EMI Payment']

function randTx(forceFlagged = false) {
  const risk = forceFlagged
    ? Math.floor(Math.random() * 35) + 60
    : Math.random() < 0.18
      ? Math.floor(Math.random() * 40) + 55
      : Math.floor(Math.random() * 35) + 2
  const status = risk > 55 ? 'FLAGGED' : risk > 32 ? 'REVIEW' : 'CLEARED'
  return {
    id: `SS${Date.now()}${Math.floor(Math.random() * 999)}`,
    sender:    NAMES[Math.floor(Math.random() * NAMES.length)],
    receiver:  NAMES[Math.floor(Math.random() * NAMES.length)],
    amount:    status === 'FLAGGED' ? Math.floor(Math.random() * 150000) + 50000 : Math.floor(Math.random() * 15000) + 200,
    type:      TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)],
    city:      CITIES[Math.floor(Math.random() * CITIES.length)],
    device:    DEVICES[Math.floor(Math.random() * DEVICES.length)],
    risk, status, timestamp: new Date(),
  }
}

const fmtAmt  = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

const COLS = ['REFERENCE', 'SENDER', 'AMOUNT', 'TYPE', 'LOCATION', 'TIME', 'RISK INDEX', 'STATUS']

export default function Monitoring() {
  const [txns,   setTxns]   = useState(() => Array.from({ length: 30 }, () => randTx()))
  const [filter, setFilter] = useState('ALL')
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setTxns((p) => [...p.slice(-199), randTx()]), 2800)
    return () => clearInterval(id)
  }, [paused])

  const injectAttack = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => setTxns((p) => [...p.slice(-199), randTx(true)]), i * 300)
    }
  }

  const list = filter === 'ALL' ? txns : txns.filter((t) => t.status === filter)

  return (
    <div className="animate-fade">
      <PageHeader title="Live Monitoring" subtitle="Real-time transaction feed with continuous risk evaluation." />

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'FLAGGED', 'REVIEW', 'CLEARED'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
              background: filter === f ? 'var(--accent-bg)' : 'var(--surface)',
              color: filter === f ? 'var(--accent)' : 'var(--text-sub)',
              fontSize: 12, fontWeight: filter === f ? 700 : 500, cursor: 'pointer',
            }}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700 }}>
                {f === 'ALL' ? txns.length : txns.filter((t) => t.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!paused && <LiveDot />}
          <Button variant="secondary" onClick={() => setPaused((p) => !p)} style={{ fontSize: 12, padding: '6px 14px' }}>
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="danger" onClick={injectAttack} style={{ fontSize: 12, padding: '6px 14px' }}>
            Inject Test Cases
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.9fr 0.9fr 1fr 0.85fr 0.9fr',
          padding: '10px 18px', borderBottom: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: '0.08em',
        }}>
          {COLS.map((h) => <div key={h}>{h}</div>)}
        </div>

        {/* Rows */}
        <div style={{ maxHeight: 480, overflowY: 'auto' }}>
          {list.length === 0 && (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>No transactions match this filter.</div>
          )}
          {list.slice().reverse().map((t, i) => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.9fr 0.9fr 1fr 0.85fr 0.9fr',
              padding: '9px 18px', borderBottom: '1px solid var(--border)',
              background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
              alignItems: 'center', fontSize: 13,
            }}>
              <div style={{ color: 'var(--accent)', fontSize: 11, fontFamily: 'monospace' }}>{t.id.slice(0, 14)}…</div>
              <div style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sender}</div>
              <div style={{ color: 'var(--text)', fontWeight: 700 }}>{fmtAmt(t.amount)}</div>
              <div style={{ color: 'var(--text-sub)', fontSize: 12 }}>{t.type.split(' ')[0]}</div>
              <div style={{ color: 'var(--text-sub)', fontSize: 12 }}>{t.city}</div>
              <div style={{ color: 'var(--text-mute)', fontSize: 11, fontFamily: 'monospace' }}>{fmtTime(t.timestamp)}</div>
              <div><RiskBar value={t.risk} /></div>
              <div><StatusPill status={t.status} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
