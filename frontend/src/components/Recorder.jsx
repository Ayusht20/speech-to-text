import { useState, useRef } from 'react'
import { transcribeAudio } from '../api.js'

export default function Recorder({ onTranscript, onError, onLoading, onBlob, language }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onBlob(blob)
        await sendAudio(blob)
      }
      mediaRecorder.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      onError('Microphone access denied. Please allow microphone permission.')
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    setRecording(false)
    mediaRecorderRef.current?.stop()
  }

  const sendAudio = async (blob) => {
    onLoading(true)
    onError(null)
    try {
      const data = await transcribeAudio(blob, language, false)
      onTranscript(data)
    } catch (err) {
      onError(err.message)
    } finally {
      onLoading(false)
    }
  }

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '8px 0' }}>
      {/* Mic button */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {recording && (
          <>
            <span className="ripple-ring" style={{
              position: 'absolute', width: 96, height: 96, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', display: 'block'
            }} />
            <span className="ripple-ring-2" style={{
              position: 'absolute', width: 96, height: 96, borderRadius: '50%',
              background: 'rgba(239,68,68,0.08)', display: 'block'
            }} />
          </>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            width: 88, height: 88, borderRadius: '50%', border: 'none',
            cursor: 'pointer', fontSize: 32, position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            background: recording
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #0f2554, #2563eb)',
            boxShadow: recording
              ? '0 8px 28px rgba(239,68,68,0.35)'
              : '0 8px 28px rgba(37,99,235,0.30)',
            transform: recording ? 'scale(1.08)' : 'scale(1)',
          }}
          onMouseEnter={(e) => !recording && (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => !recording && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {recording ? '⏹' : '🎙️'}
        </button>
      </div>

      {/* State indicator */}
      {recording ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em' }}>{fmt(seconds)}</span>
          </div>
          <button
            onClick={stopRecording}
            style={{
              padding: '8px 22px', borderRadius: 99,
              background: '#fef2f2', border: '1.5px solid #fecaca',
              color: '#dc2626', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            Stop & Transcribe
          </button>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Tap the mic to start recording
        </p>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}