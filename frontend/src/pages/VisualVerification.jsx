import { useState } from 'react'
import { verifyService } from '../services/api'
import { Card, Button, AlertBanner, RiskBar, StatusPill, SectionLabel, PageHeader, ProgressBar } from '../components/UI'

function UploadZone({ file, onFile, id, label, hint }) {
  return (
    <div
      onClick={() => document.getElementById(id).click()}
      style={{
        border: `2px dashed ${file ? 'var(--accent)' : 'var(--border-mid)'}`,
        borderRadius: 8, padding: 28, textAlign: 'center', cursor: 'pointer',
        background: file ? 'var(--accent-bg)' : 'var(--bg)', marginBottom: 14,
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      <input id={id} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => onFile(e.target.files[0])} />
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text-mute)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <div style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: file ? 600 : 400 }}>{file ? file.name : label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>{file ? 'Click to replace' : hint}</div>
    </div>
  )
}

function ResultPanel({ result, type }) {
  if (!result) return null
  const color = result.status === 'FLAGGED' ? 'var(--red)' : 'var(--green)'
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${result.status === 'FLAGGED' ? 'var(--red-mid)' : 'var(--green-mid)'}`, padding: 16, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>
          {result.status === 'FLAGGED' ? 'Issue Detected' : 'Verification Passed'}
        </div>
        <StatusPill status={result.status} />
      </div>

      {type === 'qr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[['QR Codes Found', result.qr_count], ['Tampered', result.tampered ? 'Yes' : 'No'], ['Destination UPI', result.upi_id], ['Confidence', `${result.confidence}%`]].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--bg)', borderRadius: 7, padding: '8px 10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-mute)' }}>{k}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {type === 'screenshot' && result.elements && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', letterSpacing: '0.08em', marginBottom: 8 }}>ELEMENT VERIFICATION</div>
          {result.elements.map((el, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{el.name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: el.authentic ? 'var(--green)' : 'var(--red)' }}>
                {el.authentic ? 'Authentic' : 'Suspicious'}
              </span>
            </div>
          ))}
        </div>
      )}

      <RiskBar value={result.risk_score} />
      <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6 }}>Confidence: {result.confidence}%</div>

      {result.issues?.length > 0 && (
        <div style={{ marginTop: 12, background: 'var(--red-bg)', borderRadius: 7, padding: '10px 12px', border: '1px solid var(--red-mid)' }}>
          {result.issues.map((iss, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--red)', padding: '2px 0' }}>— {iss}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VisualVerification() {
  const [qrFile,  setQrFile]  = useState(null)
  const [ssFile,  setSsFile]  = useState(null)
  const [qrRes,   setQrRes]   = useState(null)
  const [ssRes,   setSsRes]   = useState(null)
  const [qrLoad,  setQrLoad]  = useState(false)
  const [ssLoad,  setSsLoad]  = useState(false)
  const [qrErr,   setQrErr]   = useState('')
  const [ssErr,   setSsErr]   = useState('')

  const runQR = async () => {
    if (!qrFile) return
    setQrLoad(true); setQrRes(null); setQrErr('')
    try {
      const res = await verifyService.scanQR(qrFile.name, qrFile.size / 1024)
      setQrRes(res)
    } catch (e) {
      setQrErr(e.response?.data?.detail || 'Scan failed.')
    } finally {
      setQrLoad(false)
    }
  }

  const runSS = async () => {
    if (!ssFile) return
    setSsLoad(true); setSsRes(null); setSsErr('')
    try {
      const res = await verifyService.verifyScreenshot(ssFile.name, ssFile.size / 1024)
      setSsRes(res)
    } catch (e) {
      setSsErr(e.response?.data?.detail || 'Verification failed.')
    } finally {
      setSsLoad(false)
    }
  }

  return (
    <div className="animate-fade">
      <PageHeader title="Visual Verification" subtitle="Verify QR codes and payment screenshots for authenticity." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* QR Scan */}
        <Card style={{ padding: 24 }}>
          <SectionLabel>QR Code Scan</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 18 }}>
            Detect tampered, stacked, or fraudulent QR codes.
          </div>
          <UploadZone file={qrFile} onFile={(f) => { setQrFile(f); setQrRes(null) }} id="qr-input" label="Upload QR Code Image" hint="PNG, JPG — max 5 MB" />
          <AlertBanner message={qrErr} type="error" onClose={() => setQrErr('')} />
          <Button onClick={runQR} loading={qrLoad} disabled={!qrFile || qrLoad} style={{ width: '100%', marginBottom: 12 }}>
            Scan QR Code
          </Button>
          {qrLoad && <ProgressBar />}
          <ResultPanel result={qrRes} type="qr" />
        </Card>

        {/* Screenshot Verification */}
        <Card style={{ padding: 24 }}>
          <SectionLabel>Payment Proof Verification</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 18 }}>
            Verify authenticity of payment confirmation screenshots.
          </div>
          <UploadZone file={ssFile} onFile={(f) => { setSsFile(f); setSsRes(null) }} id="ss-input" label="Upload Payment Screenshot" hint="PNG, JPG — max 10 MB" />
          <AlertBanner message={ssErr} type="error" onClose={() => setSsErr('')} />
          <Button onClick={runSS} loading={ssLoad} disabled={!ssFile || ssLoad} style={{ width: '100%', marginBottom: 12 }}>
            Verify Screenshot
          </Button>
          {ssLoad && <ProgressBar />}
          <ResultPanel result={ssRes} type="screenshot" />
        </Card>
      </div>
    </div>
  )
}
