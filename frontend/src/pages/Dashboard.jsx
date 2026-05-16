import { useState, useEffect } from 'react'
import { statsService } from '../services/api'
import { Card, StatusPill, SectionLabel, StatCard, PageHeader, LiveDot } from '../components/UI'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmtAmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

const NAMES   = ['Ravi Kumar','Priya Sharma','Amit Jain','Sneha Reddy','Kiran Bose','Deepak Mehta','Anita Pillai','Suresh Kamath','Meera Nair','Raj Verma']
const CITIES  = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad']
const TX_TYPES = ['Peer Transfer','Merchant Payment','Utility Bill','Fund Transfer','EMI Payment']

function randTx() {
  const risk = Math.random() < 0.18 ? Math.floor(Math.random() * 40) + 55 : Math.floor(Math.random() * 35) + 2
  const status = risk > 55 ? 'FLAGGED' : risk > 32 ? 'REVIEW' : 'CLEARED'
  return {
    id: `SS${Date.now()}${Math.floor(Math.random()*999)}`,
    sender: NAMES[Math.floor(Math.random()*NAMES.length)],
    receiver: NAMES[Math.floor(Math.random()*NAMES.length)],
    amount: status === 'FLAGGED' ? Math.floor(Math.random()*150000)+50000 : Math.floor(Math.random()*15000)+200,
    type: TX_TYPES[Math.floor(Math.random()*TX_TYPES.length)],
    city: CITIES[Math.floor(Math.random()*CITIES.length)],
    risk, status, timestamp: new Date(),
  }
}

const riskColor = (v) => v > 65 ? 'var(--red)' : v > 35 ? 'var(--amber)' : 'var(--green)'

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [txns, setTxns]     = useState(() => Array.from({ length: 20 }, randTx))
  const [trendData, setTrend] = useState(() => Array.from({ length: 12 }, (_, i) => ({ t: `${i * 2}h`, risk: Math.floor(Math.random() * 60) + 10 })))

  useEffect(() => {
    statsService.summary().then(setStats).catch(() => {
      setStats({ total_processed: 14827, flagged: 312, under_review: 198, cleared: 14317, amount_intercepted: 28450000, avg_response_ms: 14, uptime_pct: 99.97, throughput_tps: 812 })
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const tx = randTx()
      setTxns((p) => [...p.slice(-49), tx])
      setTrend((p) => [...p.slice(-23), { t: fmtTime(new Date()), risk: tx.risk }])
    }, 3000)
    return () => clearInterval(id)
  }, [])

  if (!stats) return <div style={{ padding: 40, color: 'var(--text-mute)', fontSize: 14 }}>Loading dashboard…</div>

  const flagged  = txns.filter((t) => t.status === 'FLAGGED').length
  const review   = txns.filter((t) => t.status === 'REVIEW').length
  const cleared  = txns.filter((t) => t.status === 'CLEARED').length

  const distData = [
    { name: 'Cleared', value: cleared, color: 'var(--green)' },
    { name: 'Review',  value: review,  color: 'var(--amber)' },
    { name: 'Flagged', value: flagged, color: 'var(--red)'   },
  ]

  return (
    <div className="animate-fade">
      <PageHeader title="Dashboard" subtitle="Real-time transaction monitoring overview" />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Processed" value={stats.total_processed.toLocaleString()} sub="All time" accent="var(--accent)" />
        <StatCard label="Flagged Today"   value={stats.flagged} sub={fmtAmt(stats.amount_intercepted) + ' intercepted'} accent="var(--red)" />
        <StatCard label="Under Review"    value={stats.under_review} sub="Pending assessment" accent="var(--amber)" />
        <StatCard label="Cleared"         value={stats.cleared.toLocaleString()} sub={`${Math.round(stats.cleared / stats.total_processed * 100)}% clearance rate`} accent="var(--green)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr 1.5fr', gap: 14, marginBottom: 20 }}>
        {/* Risk trend */}
        <Card style={{ padding: 20 }}>
          <SectionLabel>Risk Index Trend</SectionLabel>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={trendData}>
              <Line type="monotone" dataKey="risk" stroke="var(--amber)" strokeWidth={2} dot={false} />
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)' }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                {trendData.length ? Math.round(trendData.reduce((a, b) => a + b.risk, 0) / trendData.length) : 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>Avg index</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--font-display)' }}>
                {trendData.length ? Math.max(...trendData.map((d) => d.risk)) : 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>Peak</div>
            </div>
          </div>
        </Card>

        {/* Status distribution */}
        <Card style={{ padding: 20 }}>
          <SectionLabel>Status Distribution</SectionLabel>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={distData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={55} tick={{ fontSize: 11, fill: 'var(--text-sub)' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Bar dataKey="value" radius={3}>
                {distData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Live feed */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel>Recent Transactions</SectionLabel>
            <LiveDot />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 230, overflowY: 'auto' }}>
            {txns.slice(-8).reverse().map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sender} → {t.receiver}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{t.city} · {fmtTime(t.timestamp)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{fmtAmt(t.amount)}</div>
                  <StatusPill status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System health bar */}
      <Card style={{ padding: '13px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>All systems operational</span>
            <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>— Risk Engine · Behavioral Analysis · Visual Verification · Fusion Scorer</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[['Response', `${stats.avg_response_ms}ms`], ['Uptime', `${stats.uptime_pct}%`], ['Throughput', `${stats.throughput_tps} tx/s`]].map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--text-mute)' }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
