import { useState } from 'react'
import { login, register } from '../api.js'

export default function AuthForm({ onAuth, onBack }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (!email || !password) return setError('Both fields are required')
    setLoading(true)
    try {
      const data = mode === 'login'
        ? await login(email, password)
        : await register(email, password)
      onAuth(data.email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-sm">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 group"
          style={{ color: 'var(--text-muted)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span
            style={{ display: 'inline-block', transition: 'transform 0.2s' }}
            className="group-hover:-translate-x-1"
          >←</span>
          Back to home
        </button>

        <div className="card p-8 fade-up">
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #0f2554, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
            }}>🎙️</div>
            <div>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: 'var(--navy)', lineHeight: 1.1 }}>
                VoiceScribe
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </div>
            </div>
          </div>

          {/* Tab toggle */}
          <div style={{
            display: 'flex', gap: 4, background: 'var(--sky)', borderRadius: 12,
            padding: 4, marginBottom: 24, border: '1px solid var(--border)'
          }}>
            {[['login', 'Sign In'], ['register', 'Sign Up']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13,
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  transition: 'all 0.2s',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? 'var(--navy)' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 2px 8px rgba(15,37,84,0.08)' : 'none',
                }}
              >{label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="input-field"
              />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, padding: '10px 14px',
                color: '#dc2626', fontSize: 13
              }}>
                ⚠️ {error}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite'
                  }} />
                  Please wait…
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
            Transcribe freely · Sign in to save & manage
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}