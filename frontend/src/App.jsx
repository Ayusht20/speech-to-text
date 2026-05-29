import { useState, useEffect } from 'react'
import AuthForm from './components/AuthForm'
import Recorder from './components/Recorder'
import TranscriptPanel from './components/TranscriptPanel'
import HistoryPanel from './components/HistoryPanel'
import { logout } from './api.js'

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'gu', label: '🇮🇳 Gujarati' },
  { code: 'ta', label: '🇮🇳 Tamil' },
  { code: 'te', label: '🇮🇳 Telugu' },
  { code: 'mr', label: '🇮🇳 Marathi' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'pt', label: '🇧🇷 Portuguese' },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [tab, setTab] = useState('record')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('en')
  const [blob, setBlob] = useState(null)
  const [historyKey, setHistoryKey] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('email')
    if (token && email) setUser(email)
  }, [])

  const handleAuth = (email) => {
    setUser(email)
    setShowAuth(false)
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setResult(null)
    setError(null)
    setTab('record')
  }

  // Show auth modal when guest tries to save
  const handleLoginRequired = () => setShowAuth(true)

  if (showAuth && !user) {
    return (
      <div className="relative">
        <AuthForm onAuth={handleAuth} />
        <button
          onClick={() => setShowAuth(false)}
          className="fixed top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between pt-6 px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">🎙️ Speech to Text</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {user ? user : 'Guest — transcribe freely'}
            </p>
          </div>
          {user ? (
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-red-200 transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition"
            >
              Login / Register
            </button>
          )}
        </div>

        {/* Tabs — History only visible when logged in */}
        <div className="flex gap-1 mx-8 mt-5 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('record')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition
              ${tab === 'record' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🎙️ Record
          </button>
          <button
            onClick={() => user ? setTab('history') : setShowAuth(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition
              ${tab === 'history' && user ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {user ? '📂 History' : '🔒 History'}
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-6">
          {tab === 'record' || !user ? (
            <>
              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-1.5">🌐 Select Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>

              <Recorder
                language={language}
                onTranscript={(data) => { setResult(data); setError(null) }}
                onError={setError}
                onLoading={setLoading}
                onBlob={setBlob}
              />
              <TranscriptPanel
                result={result}
                loading={loading}
                error={error}
                user={user}
                blob={blob}
                language={language}
                onSaved={() => setHistoryKey((k) => k + 1)}
                onLoginRequired={handleLoginRequired}
              />
            </>
          ) : (
            <HistoryPanel key={historyKey} />
          )}
        </div>

      </div>
    </div>
  )
}