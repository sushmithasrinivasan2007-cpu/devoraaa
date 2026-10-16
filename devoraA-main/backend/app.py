"""
Devora AI - Python Flask Backend Application Entry Point
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from services.msg91_service import send_sms

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Devora AI Campus Operations Engine",
        "version": "1.0.0"
    })

@app.route("/api/sms/send", methods=["POST"])
def trigger_sms():
    data = request.json or {}
    phone = data.get("phone")
    message = data.get("message")
    event = data.get("trigger_event", "Admin Trigger")
    
    if not phone or not message:
        return jsonify({"error": "phone and message are required"}), 400
        
    result = send_sms(phone, message, trigger_event=event)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=True)
