import { useEffect, useState } from 'react'
import { fetchHistory, deleteTranscript } from '../api.js'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryPanel() {
  const [transcripts, setTranscripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchHistory()
      setTranscripts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transcript?')) return
    try {
      await deleteTranscript(id)
      setTranscripts((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      alert('Delete failed: ' + e.message)
    }
  }

  const downloadTxt = (text, id) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${id.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        ⚠️ {error}
      </div>
    )
  }

  if (transcripts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📂</p>
        <p className="text-sm">No transcripts yet. Record something first!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-gray-500">{transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''} saved</p>
        <button onClick={load} className="text-xs text-violet-600 hover:underline">↻ Refresh</button>
      </div>

      {transcripts.map((t) => (
        <div
          key={t.id}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-violet-300 transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm text-gray-800 ${expanded === t.id ? '' : 'line-clamp-2'} cursor-pointer`}
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                {t.text || <span className="italic text-gray-400">Empty transcript</span>}
              </p>
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span>🕐 {formatDate(t.created_at)}</span>
                <span>📝 {t.words} words</span>
                <span>🎯 {t.confidence}%</span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => downloadTxt(t.text, t.id)}
                className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                title="Download"
              >
                ⬇️
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>

          {expanded === t.id && (
            <button
              onClick={() => setExpanded(null)}
              className="mt-2 text-xs text-violet-500 hover:underline"
            >
              Show less
            </button>
          )}
        </div>
      ))}
    </div>
  )
}