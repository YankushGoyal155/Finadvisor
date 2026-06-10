import sqlite3
import hashlib
import os

DB_FILE = "finance_ai.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    # Create users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT
        )
    ''')
    # Robust migration: add missing columns if they don't exist yet
    existing_columns = [row[1] for row in c.execute('PRAGMA table_info(users)').fetchall()]
    if 'email' not in existing_columns:
        try:
            c.execute('ALTER TABLE users ADD COLUMN email TEXT')
        except sqlite3.OperationalError:
            pass
    if 'password_hash' not in existing_columns:
        try:
            c.execute('ALTER TABLE users ADD COLUMN password_hash TEXT')
        except sqlite3.OperationalError:
            pass
        
    # Create threads table (Each chat session)
    c.execute('''
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Create messages table
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            thread_id INTEGER,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (thread_id) REFERENCES threads (id)
        )
    ''')
    try:
        c.execute('ALTER TABLE messages ADD COLUMN thread_id INTEGER')
    except sqlite3.OperationalError:
        pass # thread_id might already exist
    
    # Create OTP table
    c.execute('''
        CREATE TABLE IF NOT EXISTS otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(username, email, password):
    conn = get_db_connection()
    c = conn.cursor()
    pwd_hash = hash_password(password) if password else None
    try:
        c.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', 
                  (username, email, pwd_hash))
        conn.commit()
        user_id = c.lastrowid
        return user_id, None
    except sqlite3.IntegrityError:
        return None, "Email or Username already exists"
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ?', (email, email))
    user = c.fetchone()
    conn.close()
    return dict(user) if user else None

def verify_user_password(email, password):
    user = get_user_by_email(email)
    if user and user.get('password_hash') == hash_password(password):
        return user
    return None

def create_otp(email, code):
    conn = get_db_connection()
    c = conn.cursor()
    # Delete old OTPs for this email that might still exist to keep it clean
    c.execute('DELETE FROM otps WHERE email = ?', (email,))
    c.execute('INSERT INTO otps (email, code) VALUES (?, ?)', (email, code))
    conn.commit()
    conn.close()

def verify_otp(email, code):
    conn = get_db_connection()
    c = conn.cursor()
    # Check if OTP exists and is correct
    c.execute('SELECT id FROM otps WHERE email = ? AND code = ?', (email, code))
    otp_record = c.fetchone()
    if otp_record:
        # OTP is single-use
        c.execute('DELETE FROM otps WHERE id = ?', (otp_record['id'],))
        conn.commit()
        conn.close()
        return True
    conn.close()
    return False

def save_message(user_id, role, content, thread_id=None):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO messages (user_id, role, content, thread_id) VALUES (?, ?, ?, ?)',
              (user_id, role, content, thread_id))
    # Update the thread's last_updated timestamp
    if thread_id:
        c.execute('UPDATE threads SET last_updated = CURRENT_TIMESTAMP WHERE id = ?', (thread_id,))
    conn.commit()
    conn.close()

def get_user_messages(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT role, content, timestamp FROM messages WHERE user_id = ? AND thread_id IS NULL ORDER BY id ASC', (user_id,))
    messages = [dict(row) for row in c.fetchall()]
    conn.close()
    return messages

def get_user_threads(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, title, last_updated FROM threads WHERE user_id = ? ORDER BY last_updated DESC', (user_id,))
    threads = [dict(row) for row in c.fetchall()]
    conn.close()
    return threads

def create_thread(user_id, title):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO threads (user_id, title) VALUES (?, ?)', (user_id, title))
    conn.commit()
    thread_id = c.lastrowid
    conn.close()
    return thread_id

def get_thread_messages(thread_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT role, content, timestamp FROM messages WHERE thread_id = ? ORDER BY id ASC', (thread_id,))
    messages = [dict(row) for row in c.fetchall()]
    conn.close()
    return messages

def delete_thread(thread_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM messages WHERE thread_id = ?', (thread_id,))
    c.execute('DELETE FROM threads WHERE id = ?', (thread_id,))
    conn.commit()
    conn.close()

def delete_user_history(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM messages WHERE user_id = ?', (user_id,))
    c.execute('DELETE FROM threads WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()
