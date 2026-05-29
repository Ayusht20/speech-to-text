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

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

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
      onError('Microphone access denied.')
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
      // Always transcribe without saving — user saves manually
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
    <div className="flex flex-col items-center gap-5">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl transition-all duration-200 shadow-lg
          ${recording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-violet-600 hover:bg-violet-700 hover:scale-105'
          }`}
      >
        {recording ? '⏹' : '🎙️'}
      </button>

      {recording ? (
        <div className="flex items-center gap-2 text-red-500 font-medium text-sm">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
          Recording — {fmt(seconds)}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Click the mic to start recording</p>
      )}

      {recording && (
        <button
          onClick={stopRecording}
          className="px-5 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium hover:bg-red-200 transition"
        >
          Stop & Transcribe
        </button>
      )}
    </div>
  )
}