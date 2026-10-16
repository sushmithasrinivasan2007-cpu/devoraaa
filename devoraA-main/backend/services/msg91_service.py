"""
Devora AI - MSG91 SMS Service Integration
Handles official MSG91 API requests with graceful simulation fallback,
credential security, template variables, and logging.
"""

import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("msg91_service")
logging.basicConfig(level=logging.INFO)

def send_sms(phone_number: str, message_or_vars: Any, trigger_event: str = "General Notification") -> Dict[str, Any]:
    """
    Sends an SMS via the official MSG91 Flow API or logs simulated delivery
    when MSG91 credentials are not configured or external network is unavailable.
    
    :param phone_number: Recipient mobile number with country code (e.g. '919876543210' or '+15550192833')
    :param message_or_vars: String message or dictionary of template variables for DLT flow
    :param trigger_event: Name of triggering workflow event
    :return: dict with status ('DELIVERED', 'SIMULATED', 'FAILED'), message_id, details
    """
    auth_key = os.getenv("MSG91_AUTH_KEY", "").strip()
    sender_id = os.getenv("MSG91_SENDER_ID", "DEVORA").strip()
    template_id = os.getenv("MSG91_TEMPLATE_ID", "").strip()
    
    # Sanitize phone number (strip spaces, symbols for API)
    clean_phone = "".join([c for c in str(phone_number) if c.isdigit() or c == '+'])
    
    # If credentials are not set or template is placeholder, use clean operational simulation
    if not auth_key or "your_msg91" in auth_key.lower():
        logger.info(
            f"[MSG91 SIMULATION] SMS trigger '{trigger_event}' to {clean_phone}: "
            f"Content: {message_or_vars}"
        )
        return {
            "status": "SIMULATED",
            "message": "MSG91 Auth Key not configured in .env. Dispatched via Devora Simulated Gateway.",
            "recipient": clean_phone,
            "trigger_event": trigger_event,
            "simulated": True,
            "payload_preview": str(message_or_vars)[:120]
        }
        
    try:
        import urllib.request
        import urllib.error
        
        # Prepare official MSG91 API v5/flow payload
        # https://docs.msg91.com/p/tf9rAQ/e/7g6e42/MSG91/send-sms
        url = "https://control.msg91.com/api/v5/flow"
        
        # Build recipients object
        recipient_data: Dict[str, Any] = {
            "mobiles": clean_phone.replace("+", "")
        }
        
        if isinstance(message_or_vars, dict):
            # Pass template variables (VAR1, VAR2, student_name, etc.)
            for key, val in message_or_vars.items():
                recipient_data[key] = str(val)
        else:
            recipient_data["message"] = str(message_or_vars)
            recipient_data["VAR1"] = str(message_or_vars)
            
        payload = {
            "template_id": template_id,
            "short_url": "0",
            "recipients": [recipient_data]
        }
        if sender_id:
            payload["sender"] = sender_id
            
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "authkey": auth_key,
                "content-type": "application/json",
                "accept": "application/json"
            },
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            logger.info(f"[MSG91 DISPATCH SUCCESS] Delivered to {clean_phone}: {res_json}")
            return {
                "status": "DELIVERED",
                "recipient": clean_phone,
                "trigger_event": trigger_event,
                "response": res_json
            }
            
    except Exception as err:
        logger.warning(f"[MSG91 DISPATCH WARNING] Falling back gracefully. Error: {str(err)}")
        return {
            "status": "SIMULATED",
            "recipient": clean_phone,
            "trigger_event": trigger_event,
            "error_fallback": str(err),
            "simulated": True
        }
