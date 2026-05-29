import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)


# ── Auth ──────────────────────────────────────────────
def create_user(email, password_hash):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id, email, created_at",
        (email, password_hash),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


def get_user_by_email(email):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


# ── Transcripts ───────────────────────────────────────
def save_transcript(user_id, text, confidence, words, filename):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO transcripts (user_id, text, confidence, words, filename)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
        """,
        (user_id, text, confidence, words, filename),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


def get_all_transcripts(user_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM transcripts WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def delete_transcript(transcript_id, user_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM transcripts WHERE id = %s AND user_id = %s",
        (transcript_id, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()
    return True