import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Email configuration
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "Smart Health Care <noreply@smarthealthcare.com>")

# Check if email is configured
EMAIL_ENABLED = bool(EMAIL_USERNAME and EMAIL_PASSWORD)

def create_email_template(title: str, message: str, recipient_name: str) -> str:
    """Create HTML email template"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border: 1px solid #ddd;
            }}
            .footer {{
                background: #333;
                color: #fff;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                border-radius: 0 0 10px 10px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 30px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
            .message-box {{
                background: white;
                padding: 20px;
                border-left: 4px solid #667eea;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏥 Smart Health Care</h1>
        </div>
        <div class="content">
            <h2>Hello {recipient_name},</h2>
            <div class="message-box">
                <h3>{title}</h3>
                <p>{message}</p>
            </div>
            <p>Please log in to your dashboard to view more details.</p>
            <a href="http://localhost:5173/login" class="button">Go to Dashboard</a>
        </div>
        <div class="footer">
            <p>This is an automated notification from Smart Health Care System.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """
    return html


def send_email(
    to_email: str,
    subject: str,
    title: str,
    message: str,
    recipient_name: str = "User"
) -> bool:
    """
    Send email notification
    Returns True if successful, False otherwise
    """
    if not EMAIL_ENABLED:
        logger.warning("Email not configured. Skipping email send.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_FROM
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Create HTML content
        html_content = create_email_template(title, message, recipient_name)
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_notification_email(notification_type: str, to_email: str, recipient_name: str, title: str, message: str) -> bool:
    """
    Send notification email based on type
    """
    subject_map = {
        "medicine_reminder": "💊 Medicine Reminder",
        "appointment_reminder": "📅 Appointment Reminder",
        "follow_up_reminder": "🔔 Follow-up Reminder",
        "health_check_reminder": "❤️ Health Check Reminder"
    }
    
    subject = subject_map.get(notification_type, "🔔 Notification from Smart Health Care")
    
    return send_email(
        to_email=to_email,
        subject=subject,
        title=title,
        message=message,
        recipient_name=recipient_name
    )
