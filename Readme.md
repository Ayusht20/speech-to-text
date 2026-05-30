# 🎙️ VoiceScribe — Speech to Text

![Flask](https://img.shields.io/badge/Flask-Python-0f2554?style=flat-square\&logo=flask)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square\&logo=react)
![Deepgram](https://img.shields.io/badge/Deepgram-00d4ff?style=flat-square)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-39e09b?style=flat-square)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Spaces-FFD21E?style=flat-square\&logo=huggingface)

VoiceScribe is a full-stack AI-powered speech-to-text platform that converts spoken audio into accurate text using Deepgram AI. Users can transcribe audio instantly, while authenticated users can securely save and manage transcript history.

---

## 🌐 Live Demo

| Service      | URL                                                        |
| ------------ | ---------------------------------------------------------- |
| Frontend     | https://speech-to-text-weld-seven.vercel.app               |
| Backend      | https://ayushTrilokchandani-speech-to-text.hf.space        |
| Health Check | https://ayushTrilokchandani-speech-to-text.hf.space/health |

---
## 📸 Screenshots

### 🔐 Login

<p align="center">
  <img src="screenshots/login.png" alt="Login">
</p>

### 🏠 Home

<p align="center">
  <img src="screenshots/home.png" alt="Home" >
</p>

### 🌐 Language Selection

<p align="center">
  <img src="screenshots/language.png" alt="Language Selection" >
</p>

### 🎙️ Recording Audio

<p align="center">
  <img src="screenshots/record.png" alt="Recording">
</p>

### 📝 Generated Transcript

<p align="center">
  <img src="screenshots/transcript.png" alt="Transcript" >
</p>

### 📂 Transcript History

<p align="center">
  <img src="screenshots/history.png" alt="History">
</p>

---

## 🛠️ Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | React 18, Vite, Tailwind CSS     |
| Backend        | Flask, Flask-CORS, PyJWT, bcrypt |
| Database       | Neon PostgreSQL                  |
| Speech-to-Text | Deepgram AI                      |
| Hosting        | Vercel + Hugging Face Spaces     |

---

## ✨ Features

* 🎙️ Browser-based audio recording
* 🌐 Supports 10+ languages
* 🤖 AI transcription with confidence score
* 🔒 JWT authentication
* 💾 Save transcript history
* 📂 View and manage past transcripts
* 📋 Copy or download transcripts as `.txt`
* 🆓 Guest mode with optional account creation

---

## 🏭 Use Cases

* 🏥 Healthcare documentation
* ⚖️ Legal transcription
* 🎓 Lecture notes and education
* 🏢 Meeting transcription
* 📺 Media and subtitles
* ♿ Accessibility support

---

## 📁 Project Structure

```text
voicescribe/
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── db.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── components/
        ├── App.jsx
        └── api.js
```

---

## 🚀 Local Setup

```bash
git clone <repo-url>

# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev
```

Create a `.env` file:

```env
DEEPGRAM_API_KEY=
DATABASE_URL=
JWT_SECRET=
```

---

## 🔮 Future Scope

* Real-time streaming transcription
* PDF/DOCX export
* AI transcript summarization
* Speaker diarization
* Mobile application
* Transcript search

---

## 👨‍💻 Author

**Ayush Trilokchandani**

* GitHub: https://github.com/AyushTrilokchandani
* Hugging Face: https://huggingface.co/ayushTrilokchandani

---

## 📄 License

MIT License

---

<div align="center">
  <p>Made with ❤️ using Flask · React · Deepgram · Neon · Hugging Face</p>
  <p>⭐ Star the repository if you found it useful!</p>
</div>
