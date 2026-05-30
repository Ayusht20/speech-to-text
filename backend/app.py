import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from db import (
    create_user, get_user_by_email,
    save_transcript, get_all_transcripts, delete_transcript
)
from auth import hash_password, check_password, generate_token, token_required

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://speech-to-text-weld-seven.vercel.app"
])

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    hashed = hash_password(password)
    user = create_user(email, hashed)
    token = generate_token(str(user["id"]), user["email"])
    return jsonify({"token": token, "email": user["email"]}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = get_user_by_email(email)
    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(str(user["id"]), user["email"])
    return jsonify({"token": token, "email": user["email"]})


@app.route("/transcribe", methods=["POST"])
def transcribe():
    # Optional auth — check token if present, but don't block if missing
    user_id = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            from auth import decode_token
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            user_id = payload["user_id"]
        except Exception:
            pass  # invalid token → treat as guest

    if "file" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["file"]
    audio_bytes = audio_file.read()
    filename = audio_file.filename or "recording.webm"
    lang = request.form.get("language", "en")
    should_save = request.form.get("save", "false") == "true"

    if len(audio_bytes) == 0:
        return jsonify({"error": "Empty audio file"}), 400

    deepgram_url = (
        f"https://api.deepgram.com/v1/listen"
        f"?model=nova-3&smart_format=true&punctuate=true&language={lang}"
    )
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": audio_file.content_type or "audio/webm",
    }

    try:
        dg_response = requests.post(
            deepgram_url, headers=headers, data=audio_bytes, timeout=30
        )
        dg_response.raise_for_status()
        dg_result = dg_response.json()

        channel = dg_result.get("results", {}).get("channels", [{}])[0]
        alt = channel.get("alternatives", [{}])[0]

        transcript = alt.get("transcript", "")
        confidence = round(alt.get("confidence", 0) * 100, 1)
        words = len(transcript.split()) if transcript else 0

        saved = None
        # Only save if user is logged in AND requested save
        if user_id and should_save:
            saved = save_transcript(
                user_id=user_id,
                text=transcript,
                confidence=confidence,
                words=words,
                filename=filename,
            )

        return jsonify({
            "id": str(saved["id"]) if saved else None,
            "transcript": transcript,
            "confidence": confidence,
            "words": words,
            "language": lang,
            "saved": saved is not None,
            "created_at": str(saved["created_at"]) if saved else None,
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "Deepgram timed out."}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Deepgram error: {str(e)}"}), 502
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@app.route("/transcripts", methods=["GET"])
@token_required
def list_transcripts():
    try:
        data = get_all_transcripts(request.user_id)
        return jsonify({"transcripts": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/transcripts/<transcript_id>", methods=["DELETE"])
@token_required
def remove_transcript(transcript_id):
    try:
        delete_transcript(transcript_id, request.user_id)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)