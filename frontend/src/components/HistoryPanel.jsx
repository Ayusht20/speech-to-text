import { useEffect, useState } from 'react'
import { fetchHistory, deleteTranscript } from '../api.js'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function HistoryPanel() {
  const [transcripts, setTranscripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setTranscripts(await fetchHistory()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transcript?')) return
    try {
      await deleteTranscript(id)
      setTranscripts((p) => p.filter((t) => t.id !== id))
    } catch (e) { alert('Delete failed: ' + e.message) }
  }

  const downloadTxt = (text, id) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `transcript-${id.slice(0, 8)}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div className="shimmer" style={{ height: 12, width: '100%', marginBottom: 8 }} />
          <div className="shimmer" style={{ height: 12, width: '65%' }} />
        </div>
      ))}
    </div>
  )

  if (error) return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
      ⚠️ {error}
    </div>
  )

  if (transcripts.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }} className="fade-up">
      <p style={{ fontSize: 36, marginBottom: 10 }}>📂</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>No saved transcripts yet</p>
      <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Record something and hit Save</p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}
        </span>
        <button onClick={load} style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          ↻ Refresh
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {transcripts.map((t, i) => (
          <div
            key={t.id}
            className="fade-up"
            style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 14,
              padding: 16, transition: 'border-color 0.2s, box-shadow 0.2s',
              animationDelay: `${i * 0.05}s`, opacity: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                  style={{
                    fontSize: 13, lineHeight: 1.6, color: 'var(--text)', cursor: 'pointer',
                    display: '-webkit-box', WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: expanded === t.id ? 'unset' : 2,
                    overflow: expanded === t.id ? 'visible' : 'hidden',
                  }}
                >
                  {t.text || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Empty</span>}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  {[`🕐 ${timeAgo(t.created_at)}`, `📝 ${t.words} words`, `🎯 ${t.confidence}%`].map((s) => (
                    <span key={s} style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s}</span>
                  ))}
                </div>
                {expanded === t.id && (
                  <button onClick={() => setExpanded(null)} style={{ marginTop: 6, fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Show less ↑
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => downloadTxt(t.text, t.id)}
                  style={{ padding: 7, borderRadius: 8, background: 'var(--sky)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, lineHeight: 1, transition: 'all 0.15s' }}
                  title="Download"
                >⬇️</button>
                <button onClick={() => handleDelete(t.id)}
                  style={{ padding: 7, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer', fontSize: 13, lineHeight: 1, transition: 'all 0.15s' }}
                  title="Delete"
                >🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}