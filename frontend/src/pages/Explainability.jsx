import { useState, useEffect } from 'react'
import { Card, StatusPill, RiskBar, SectionLabel, PageHeader } from '../components/UI'

const NAMES  = ['Ravi Kumar','Priya Sharma','Amit Jain','Sneha Reddy','Kiran Bose','Deepak Mehta']
const CITIES = ['Mumbai','Delhi','Patna','Lucknow','Kolkata','Chennai']

function randFlagged() {
  const risk = Math.floor(Math.random() * 40) + 56
  const status = risk > 70 ? 'FLAGGED' : 'REVIEW'
  const amount = risk > 70 ? Math.floor(Math.random() * 150000) + 60000 : Math.floor(Math.random() * 30000) + 10000
  return {
    id: `SS${Date.now()}${Math.floor(Math.random() * 999)}`,
    sender: NAMES[Math.floor(Math.random() * NAMES.length)],
    amount,
    city:   CITIES[Math.floor(Math.random() * CITIES.length)],
    risk_score:   Math.floor(Math.random() * 40) + 55,
    iso_score:    Math.floor(Math.random() * 35) + 38,
    visual_score: Math.floor(Math.random() * 30) + 28,
    final_risk: risk,
    status,
    factors: [
      risk > 70 && 'Transaction amount exceeds high-value threshold',
      risk > 65 && 'Transaction velocity limit exceeded in past hour',
      Math.random() > 0.5 && 'Geographic risk score elevated for this location',
      Math.random() > 0.6 && 'Device trust score below acceptable threshold',
      Math.random() > 0.6 && 'Unusual transaction activity window',
    ].filter(Boolean),
  }
}

const FEATURE_IMPORTANCE = [
  { label: 'Transaction Amount',    value: 27, color: 'var(--red)'   },
  { label: 'Transaction Velocity',  value: 22, color: '#D06030'      },
  { label: 'Geographic Deviation',  value: 18, color: 'var(--amber)' },
  { label: 'Device Consistency',    value: 16, color: '#B5843A'      },
  { label: 'Activity Time Pattern', value: 10, color: '#7A9E3A'      },
  { label: 'Merchant Category',     value:  7, color: 'var(--green)' },
]

const fmtAmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function Explainability() {
  const [records, setRecords] = useState(() => Array.from({ length: 12 }, randFlagged))
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (records.length && !selected) setSelected(records[0])
  }, [])

  const statusColor = selected
    ? selected.status === 'FLAGGED' ? 'var(--red)' : 'var(--amber)'
    : 'var(--accent)'

  return (
    <div className="animate-fade">
      <PageHeader title="Explainability" subtitle="Understand the factors driving each risk assessment decision." />

      <div style={{ display: 'grid', gridTemplateColumns: '0.65fr 1.35fr', gap: 16 }}>
        {/* Transaction list */}
        <Card style={{ padding: 20 }}>
          <SectionLabel>Flagged Transactions</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 520, overflowY: 'auto' }}>
            {records.map((r) => (
              <div key={r.id} onClick={() => setSelected(r)} style={{
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.12s',
                background: selected?.id === r.id ? 'var(--accent-bg)' : 'var(--bg)',
                border: `1px solid ${selected?.id === r.id ? 'var(--accent)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'monospace' }}>{r.id.slice(0, 13)}..</span>
                  <StatusPill status={r.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{fmtAmt(r.amount)}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>Index: {r.final_risk}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Explanation detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selected ? (
            <>
              {/* SHAP feature importance */}
              <Card style={{ padding: 22 }}>
                <SectionLabel>Factor Contribution (SHAP Values)</SectionLabel>
                {FEATURE_IMPORTANCE.map((f) => (
                  <div key={f.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{f.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{f.value}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${f.value}%`, background: f.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </Card>

              {/* Assessment rationale */}
              <Card style={{ padding: 22 }}>
                <SectionLabel>Assessment Rationale — {selected.id.slice(0, 16)}</SectionLabel>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: statusColor, fontFamily: 'var(--font-display)' }}>{selected.final_risk}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>Composite risk index</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusPill status={selected.status} />
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6 }}>
                      Risk {selected.risk_score} · Behavioral {selected.iso_score} · Visual {selected.visual_score}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <RiskBar value={selected.final_risk} />
                  <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 5 }}>
                    Index = (Risk × 0.5) + (Behavioral × 0.3) + (Visual × 0.2) = {selected.final_risk}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { show: selected.amount > 50000,       label: 'Amount outside normal range',     detail: `${fmtAmt(selected.amount)} exceeds established threshold` },
                    { show: selected.risk_score > 60,      label: 'Elevated risk score',             detail: `Primary score: ${selected.risk_score} / 100` },
                    { show: selected.iso_score > 40,       label: 'Behavioral deviation identified', detail: `Behavioral index: ${selected.iso_score} / 100` },
                    { show: selected.visual_score > 40,    label: 'Visual check raised concern',     detail: `Visual index: ${selected.visual_score} / 100` },
                    ...selected.factors.map((f) => ({ show: true, label: f, detail: 'Rule-based flag' })),
                  ].filter((x) => x.show).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--red-bg)', borderRadius: 8, border: '1px solid var(--red-mid)', borderLeft: '3px solid var(--red)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card style={{ padding: 40, textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <div style={{ color: 'var(--text-mute)', fontSize: 13 }}>Select a flagged transaction to view its assessment rationale.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
