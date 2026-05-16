import { useMemo } from 'react'
import { Card, SectionLabel, PageHeader } from '../components/UI'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from 'recharts'

const MODELS = [
  { name: 'Logistic Regression', accuracy: 89.2, precision: 86.1, recall: 84.3, f1: 85.2, auc: 0.921 },
  { name: 'Random Forest',       accuracy: 96.4, precision: 95.8, recall: 94.1, f1: 94.9, auc: 0.981 },
  { name: 'SVM',                 accuracy: 91.8, precision: 90.2, recall: 88.7, f1: 89.4, auc: 0.947 },
  { name: 'XGBoost',             accuracy: 97.1, precision: 96.9, recall: 96.3, f1: 96.6, auc: 0.989 },
  { name: 'ANN',                 accuracy: 95.3, precision: 94.1, recall: 93.8, f1: 93.9, auc: 0.972 },
  { name: 'Isolation Forest',    accuracy: 87.4, precision: 83.5, recall: 85.2, f1: 84.3, auc: 0.912 },
]

const COLORS = ['#9CA3AF', '#2B5CE6', '#1A5276', '#C9A94A', '#6A1A7A', '#14A085']

const HOURLY = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  normal: Math.floor(Math.random() * 80) + 10,
  flagged: h >= 0 && h <= 5 ? Math.floor(Math.random() * 18) + 5 : Math.floor(Math.random() * 8),
}))

const RISK_DIST = [
  { range: '0–20',  count: 420 },
  { range: '20–40', count: 180 },
  { range: '40–60', count: 95  },
  { range: '60–80', count: 62  },
  { range: '80–100',count: 43  },
]

const RISK_COLORS = ['#236A48', '#84cc16', '#C07828', '#f97316', '#C0392B']

const TOP_CITIES = [
  { city: 'Patna',    count: 38 },
  { city: 'Delhi',    count: 31 },
  { city: 'Lucknow',  count: 27 },
  { city: 'Mumbai',   count: 22 },
  { city: 'Kolkata',  count: 19 },
  { city: 'Jaipur',   count: 14 },
]

const RADAR_DATA = [
  { metric: 'Accuracy',  RF: 96.4, XGB: 97.1 },
  { metric: 'Precision', RF: 95.8, XGB: 96.9 },
  { metric: 'Recall',    RF: 94.1, XGB: 96.3 },
  { metric: 'F1 Score',  RF: 94.9, XGB: 96.6 },
  { metric: 'AUC',       RF: 98.1, XGB: 98.9 },
]

export default function Analytics() {
  return (
    <div className="animate-fade">
      <PageHeader title="Analytics" subtitle="Model performance metrics and transaction pattern insights." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Accuracy comparison */}
        <Card style={{ padding: 22 }}>
          <SectionLabel>Model Accuracy Comparison (%)</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MODELS} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-mute)' }} angle={-30} textAnchor="end" interval={0} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: 'var(--text-mute)' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)' }} formatter={(v) => [`${v}%`, 'Accuracy']} />
              <Bar dataKey="accuracy" radius={[4,4,0,0]}>
                {MODELS.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk distribution */}
        <Card style={{ padding: 22 }}>
          <SectionLabel>Risk Index Distribution</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RISK_DIST} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--text-mute)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-mute)' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v) => [v, 'Transactions']} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {RISK_DIST.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--green)' }}>Low Risk</span>
            <span style={{ fontSize: 10, color: 'var(--red)' }}>High Risk</span>
          </div>
        </Card>

        {/* Hourly volume */}
        <Card style={{ padding: 22 }}>
          <SectionLabel>Hourly Transaction Volume</SectionLabel>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={HOURLY} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 8, fill: 'var(--text-mute)' }} interval={2} angle={-45} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-mute)' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="normal"  name="Normal"  fill="#2B5CE6" stackId="a" radius={0} opacity={0.35} />
              <Bar dataKey="flagged" name="Flagged" fill="#C0392B" stackId="a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top flagged cities */}
        <Card style={{ padding: 22 }}>
          <SectionLabel>Top Flagged Locations</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            {TOP_CITIES.map((c, i) => (
              <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-mute)', width: 20 }}>#{i + 1}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', flex: 1, fontWeight: 500 }}>{c.city}</span>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, width: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--red)', width: `${(c.count / TOP_CITIES[0].count) * 100}%`, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', width: 24, textAlign: 'right' }}>{c.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* F1 / Recall comparison table */}
        <Card style={{ padding: 22, gridColumn: '1 / -1' }}>
          <SectionLabel>Full Model Performance Matrix</SectionLabel>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Model', 'Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUC-ROC'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Model' ? 'left' : 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-mute)', letterSpacing: '0.08em', borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m, i) => (
                  <tr key={m.name} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: m.name === 'XGBoost' ? 700 : 500, color: m.name === 'XGBoost' ? 'var(--accent)' : 'var(--text)' }}>{m.name}</td>
                    {[m.accuracy, m.precision, m.recall, m.f1].map((v, j) => (
                      <td key={j} style={{ padding: '10px 14px', textAlign: 'center', fontWeight: m.name === 'XGBoost' ? 700 : 400, color: m.name === 'XGBoost' ? 'var(--accent)' : 'var(--text)' }}>{v}%</td>
                    ))}
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: m.name === 'XGBoost' ? 700 : 400, color: m.name === 'XGBoost' ? 'var(--accent)' : 'var(--text)' }}>{m.auc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--green-bg)', borderRadius: 8, border: '1px solid var(--green-mid)' }}>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>XGBoost</span>
            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}> achieves the best overall performance: 97.1% accuracy, 96.6% F1, AUC 0.989. Recall is the critical metric — a missed fraud is costlier than a false positive.</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
