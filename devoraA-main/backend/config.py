import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 3000))
    ENV = os.getenv("FLASK_ENV", "development")
    
    # Supabase Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Gemini AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    AI_MODEL = os.getenv("AI_MODEL", "gemini-2.5-flash")
    
    # SMTP Email Configuration
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_SECURE = os.getenv("SMTP_SECURE", "false").lower() == "true"
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASS = os.getenv("SMTP_PASS", "")
    SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Devora AI Campus Operations")
    SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "notifications@devora-campus.edu")
