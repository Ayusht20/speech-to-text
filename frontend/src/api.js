const BASE = 'https://ayushtrilokchandani-speech-to-text.hf.space'
              
const getToken = () => localStorage.getItem('token')

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
})

export async function register(email, password) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Registration failed')
  localStorage.setItem('token', data.token)
  localStorage.setItem('email', data.email)
  return data
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  localStorage.setItem('token', data.token)
  localStorage.setItem('email', data.email)
  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
}

export async function transcribeAudio(blob, language = 'en', save = false) {
  const form = new FormData()
  form.append('file', blob, 'recording.webm')
  form.append('language', language)
  form.append('save', save ? 'true' : 'false')

  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}/transcribe`, {
    method: 'POST',
    headers,
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Transcription failed')
  return data
}

export async function fetchHistory() {
  const res = await fetch(`${BASE}/transcripts`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to load history')
  return data.transcripts
}

export async function deleteTranscript(id) {
  const res = await fetch(`${BASE}/transcripts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Delete failed')
  return data
}