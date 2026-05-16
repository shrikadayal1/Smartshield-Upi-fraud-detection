import { useState } from 'react'
import { assessmentService } from '../services/api'
import { Card, Input, Select, Button, AlertBanner, RiskBar, StatusPill, SectionLabel, PageHeader, ProgressBar } from '../components/UI'

const CITIES   = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Nagpur','Indore','Surat','Patna','Coimbatore']
const DEVICES  = ['iPhone 15 Pro','Samsung Galaxy S24','OnePlus 12','Pixel 8','Redmi Note 13','Oppo Reno 10','Realme 12 Pro','Vivo V29','Motorola Edge 50']
const BANKS    = ['HDFC Bank','State Bank of India','ICICI Bank','Axis Bank','Kotak Mahindra','Punjab National Bank','Bank of Baroda','Canara Bank','YES Bank','IDFC First Bank']
const TX_TYPES = ['Peer Transfer','Merchant Payment','Utility Bill','Mobile Recharge','Online Purchase','Fund Transfer','EMI Payment','Insurance Premium']

const STEPS = [
  'Receiving transaction payload',
  'Running risk scoring engine',
  'Performing behavioral analysis',
  'Running visual checks',
  'Computing fusion index',
  'Assessment complete',
]

const fmtAmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function Assessment() {
  const [form, setForm] = useState({
    amount: '', tx_type: TX_TYPES[0], city: CITIES[0],
    device: DEVICES[0], velocity_1h: '1', velocity_24h: '5',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(-1)
  const [result, setResult]   = useState(null)
  const [apiErr, setApiErr]   = useState('')

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Enter a valid positive amount'
    return e
  }

  const runAssessment = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setApiErr(''); setResult(null); setLoading(true); setStep(0)

    STEPS.forEach((_, i) => {
      if (i > 0) setTimeout(() => setStep(i), i * 420)
    })

    try {
      const data = await assessmentService.predict({
        amount: parseFloat(form.amount),
        tx_type: form.tx_type,
        city: form.city,
        device: form.device,
        velocity_1h: parseInt(form.velocity_1h, 10) || 1,
        velocity_24h: parseInt(form.velocity_24h, 10) || 5,
      })
      setTimeout(() => { setResult(data); setLoading(false); setStep(STEPS.length - 1) }, STEPS.length * 420)
    } catch (err) {
      setApiErr(err.response?.data?.detail || 'Assessment failed. Please try again.')
      setLoading(false); setStep(-1)
    }
  }

  const statusColor = result
    ? result.status === 'FLAGGED' ? 'var(--red)' : result.status === 'REVIEW' ? 'var(--amber)' : 'var(--green)'
    : 'var(--accent)'

  return (
    <div className="animate-fade">
      <PageHeader title="Transaction Assessment" subtitle="Submit a transaction for real-time risk evaluation." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Input form */}
        <Card style={{ padding: 26 }}>
          <SectionLabel>Transaction Details</SectionLabel>
          <AlertBanner message={apiErr} type="error" onClose={() => setApiErr('')} />

          <Input label="Amount (INR)" type="number" value={form.amount} onChange={set('amount')}
            placeholder="0.00" error={errors.amount} required />

          <Select label="Transaction Type" value={form.tx_type} onChange={set('tx_type')}
            options={TX_TYPES} required />

          <Select label="Origin City" value={form.city} onChange={set('city')}
            options={CITIES} required />

          <Select label="Device" value={form.device} onChange={set('device')}
            options={DEVICES} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Velocity (past 1h)" type="number" value={form.velocity_1h}
              onChange={set('velocity_1h')} placeholder="1" />
            <Input label="Velocity (past 24h)" type="number" value={form.velocity_24h}
              onChange={set('velocity_24h')} placeholder="5" />
          </div>

          <Button onClick={runAssessment} loading={loading} disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            Run Assessment
          </Button>
        </Card>

        {/* Pipeline + result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Pipeline steps */}
          <Card style={{ padding: 22 }}>
            <SectionLabel>Processing Pipeline</SectionLabel>
            {STEPS.map((s, i) => {
              const done   = !loading && result && i <= step
              const active = loading && step === i
              const past   = loading ? step > i : (result && i < step)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s',
                    background: done || past ? 'var(--green-bg)' : active ? 'var(--accent-bg)' : 'var(--bg)',
                    border: `2px solid ${done || past ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {(done || past) && <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 800 }}>✓</span>}
                    {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 0.8s infinite' }} />}
                  </div>
                  <span style={{ fontSize: 12, color: (active || done || past) ? 'var(--text)' : 'var(--text-mute)', fontWeight: active ? 600 : 400 }}>{s}</span>
                </div>
              )
            })}
            {loading && <ProgressBar />}
          </Card>

          {/* Result */}
          {result && (
            <Card style={{ padding: 22, border: `1px solid ${statusColor}33`, animation: 'fadeIn 0.35s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: statusColor, fontFamily: 'var(--font-display)' }}>
                    {result.status === 'FLAGGED' ? 'Transaction Flagged' : result.status === 'REVIEW' ? 'Sent for Review' : 'Transaction Cleared'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 3 }}>{result.transaction_id}</div>
                </div>
                <StatusPill status={result.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[['Risk Score', result.rf_score, 'var(--red)'], ['Behavioral', result.iso_score, 'var(--amber)'], ['Visual', result.visual_score, 'var(--accent)']].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: 'var(--font-display)' }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-sub)', marginBottom: 5 }}>
                  <span>Composite Risk Index</span>
                  <span style={{ fontWeight: 700, color: statusColor }}>{result.final_risk} / 100</span>
                </div>
                <RiskBar value={result.final_risk} />
                <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 5 }}>
                  Index = (Risk × 0.5) + (Behavioral × 0.3) + (Visual × 0.2)
                </div>
              </div>

              {result.factors?.length > 0 && (
                <div style={{ background: 'var(--red-bg)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--red-mid)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', marginBottom: 8, letterSpacing: '0.04em' }}>RISK FACTORS</div>
                  {result.factors.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-sub)', padding: '3px 0', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--red)', flexShrink: 0 }}>—</span>{f}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
