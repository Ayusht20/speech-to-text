import { useState } from 'react'
import { transcribeAudio } from '../api.js'

export default function TranscriptPanel({ result, loading, error, user, onSaved, blob, language, onLoginRequired }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const copyText = () => { navigator.clipboard.writeText(result.transcript); alert('Copied!') }

  const downloadTxt = () => {
    const b = new Blob([result.transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = url; a.download = `transcript-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!user) { onLoginRequired(); return }
    setSaving(true)
    try {
      await transcribeAudio(blob, language, true)
      setSaved(true); onSaved()
    } catch (e) { alert('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ marginTop: 20 }} className="fade-up">
      <div className="card-inset" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{
            width: 16, height: 16, border: '2.5px solid #bfdbfe',
            borderTopColor: 'var(--blue)', borderRadius: '50%',
            display: 'inline-block', animation: 'spin 0.7s linear infinite'
          }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Transcribing your audio…</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="shimmer" style={{ height: 12, width: '100%' }} />
          <div className="shimmer" style={{ height: 12, width: '80%' }} />
          <div className="shimmer" style={{ height: 12, width: '60%' }} />
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ marginTop: 20, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13 }} className="fade-up">
      ⚠️ {error}
    </div>
  )

  if (!result) return (
    <div style={{ marginTop: 20 }} className="fade-up delay-3">
      <div className="card-inset" style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎤</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Your transcript will appear here</p>
      </div>
    </div>
  )

  return (
    <div style={{ marginTop: 20 }} className="fade-up">
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {[
          { icon: '📝', val: `${result.words} words` },
          { icon: '🎯', val: `${result.confidence}%` },
          { icon: '🌐', val: result.language?.toUpperCase() },
        ].map((s) => (
          <span key={s.val} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, color: 'var(--blue)',
            background: 'var(--sky-mid)', border: '1px solid #bfdbfe',
            borderRadius: 99, padding: '4px 10px'
          }}>
            {s.icon} {s.val}
          </span>
        ))}
      </div>

      {/* Transcript box */}
      <div className="card-inset" style={{ padding: '16px 18px', minHeight: 100, fontSize: 14, lineHeight: 1.75, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
        {result.transcript || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No speech detected. Try speaking louder.</span>}
      </div>

      {/* Action buttons */}
      {result.transcript && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: '📋 Copy', onClick: copyText, style: { background: 'var(--sky)', border: '1.5px solid var(--border)', color: 'var(--navy)' } },
            { label: '⬇️ Download', onClick: downloadTxt, style: { background: 'var(--sky)', border: '1.5px solid var(--border)', color: 'var(--navy)' } },
          ].map((btn) => (
            <button key={btn.label} onClick={btn.onClick} style={{
              ...btn.style, padding: '9px 16px', borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >{btn.label}</button>
          ))}

          {saved ? (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#16a34a'
            }}>✅ Saved!</span>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', border: 'none',
                fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s',
                background: 'linear-gradient(135deg, #0f2554, #2563eb)',
                color: 'white', opacity: saving ? 0.6 : 1,
                boxShadow: '0 3px 12px rgba(37,99,235,0.2)',
              }}
            >{saving ? '⏳ Saving…' : user ? '💾 Save' : '🔒 Save'}</button>
          )}
        </div>
      )}

      {!user && result.transcript && (
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          💡 Sign in to save transcripts and access history
        </p>
      )}
    </div>
  )
}