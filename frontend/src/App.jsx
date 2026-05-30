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

  const handleAuth = (email) => { setUser(email); setShowAuth(false) }
  const handleLogout = () => { logout(); setUser(null); setResult(null); setError(null); setTab('record') }

  if (showAuth && !user) {
    return (
      <>
        <div className="bg-mesh" /><div className="bg-grid" />
        <AuthForm onAuth={handleAuth} onBack={() => setShowAuth(false)} />
      </>
    )
  }

  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-grid" />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Top navbar */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid var(--border)',
          background: 'rgba(248,250,255,0.8)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }} className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #0f2554, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 3px 10px rgba(37,99,235,0.2)'
            }}>🎙️</div>
            <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: 'var(--navy)' }}>
              VoiceScribe
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{user}</span>
                <button onClick={handleLogout} style={{
                  padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  background: 'var(--sky)', border: '1.5px solid var(--border)',
                  color: 'var(--navy)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  transition: 'all 0.15s',
                }}>Logout</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{
                padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600, border: 'none',
                background: 'linear-gradient(135deg, #0f2554, #2563eb)',
                color: 'white', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: '0 3px 12px rgba(37,99,235,0.25)', transition: 'all 0.15s',
              }}>Sign In</button>
            )}
          </div>
        </nav>

        {/* Main */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px 48px' }}>
          <div style={{ width: '100%', maxWidth: 520 }}>

            {/* Hero text */}
            <div style={{ textAlign: 'center', marginBottom: 28 }} className="fade-up delay-1">
              <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 32, color: 'var(--navy)', lineHeight: 1.2, marginBottom: 8 }}>
                Speak. Transcribe. <span style={{ fontStyle: 'italic', color: 'var(--blue)' }}>Done.</span>
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 340, margin: '0 auto' }}>
                {user
                  ? `Welcome back — record and save your transcripts`
                  : 'Record freely without an account · Sign in to save & revisit'}
              </p>
            </div>

            {/* Main card */}
            <div className="card fade-up delay-2">
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {[
                  { key: 'record', label: '🎙️ Record' },
                  { key: 'history', label: user ? '📂 History' : '🔒 History' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => key === 'history' && !user ? setShowAuth(true) : setTab(key)}
                    style={{
                      flex: 1, padding: '14px 0', fontSize: 13, fontWeight: 600,
                      border: 'none', background: 'none', cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s',
                      color: tab === key && (key === 'record' || user) ? 'var(--navy)' : 'var(--text-muted)',
                      borderBottom: tab === key && (key === 'record' || user)
                        ? '2.5px solid var(--blue)' : '2.5px solid transparent',
                    }}
                  >{label}</button>
                ))}
              </div>

              {/* Content */}
              <div style={{ padding: 24 }}>
                {tab === 'record' || !user ? (
                  <>
                    {/* Language */}
                    <div style={{ marginBottom: 22 }} className="fade-up delay-3">
                      <label style={{
                        display: 'block', fontSize: 11, fontWeight: 700,
                        color: 'var(--text-muted)', marginBottom: 8,
                        textTransform: 'uppercase', letterSpacing: '0.06em'
                      }}>Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="input-field"
                        style={{ cursor: 'pointer' }}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="fade-up delay-4">
                      <Recorder
                        language={language}
                        onTranscript={(data) => { setResult(data); setError(null) }}
                        onError={setError}
                        onLoading={setLoading}
                        onBlob={setBlob}
                      />
                    </div>

                    <TranscriptPanel
                      result={result} loading={loading} error={error}
                      user={user} blob={blob} language={language}
                      onSaved={() => setHistoryKey((k) => k + 1)}
                      onLoginRequired={() => setShowAuth(true)}
                    />
                  </>
                ) : (
                  <HistoryPanel key={historyKey} />
                )}
              </div>
            </div>

            {/* Footer */}
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24 }} className="fade-up delay-5">
              Powered by Deepgram · Neon · Flask · React
            </p>
          </div>
        </main>
      </div>
    </>
  )
}