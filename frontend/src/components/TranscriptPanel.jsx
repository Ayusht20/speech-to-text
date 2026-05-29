import { useState } from 'react'
import { transcribeAudio } from '../api.js'

export default function TranscriptPanel({ result, loading, error, user, onSaved, blob, language, onLoginRequired }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(result.transcript)
    alert('Copied!')
  }

  const downloadTxt = () => {
    const b = new Blob([result.transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!user) {
      onLoginRequired()
      return
    }
    setSaving(true)
    try {
      await transcribeAudio(blob, language, true)
      setSaved(true)
      onSaved()
    } catch (e) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 text-gray-500">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-sm">Transcribing…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        ⚠️ {error}
      </div>
    )
  }

  if (!result) {
    return (
      <p className="mt-6 text-center text-gray-400 text-sm">
        Your transcript will appear here after recording.
      </p>
    )
  }

  return (
    <div className="mt-6 w-full">
      <div className="flex gap-4 mb-2 text-xs text-gray-400">
        <span>📝 {result.words} words</span>
        <span>🎯 {result.confidence}%</span>
        <span>🌐 {result.language}</span>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[100px] text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
        {result.transcript || (
          <span className="text-gray-400 italic">No speech detected.</span>
        )}
      </div>

      {result.transcript && (
        <div className="flex gap-3 mt-3 flex-wrap">
          <button
            onClick={copyText}
            className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition"
          >
            📋 Copy
          </button>
          <button
            onClick={downloadTxt}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition"
          >
            ⬇️ Download .txt
          </button>

          {/* Save button */}
          {saved ? (
            <span className="px-4 py-2 bg-green-50 text-green-600 text-sm rounded-lg border border-green-200">
              ✅ Saved!
            </span>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              {saving ? 'Saving…' : user ? '💾 Save' : '🔒 Save (Login required)'}
            </button>
          )}
        </div>
      )}

      {/* Guest nudge */}
      {!user && result.transcript && (
        <p className="mt-3 text-xs text-gray-400">
          💡 Create a free account to save transcripts and view history.
        </p>
      )}
    </div>
  )
}