import smtplib
import ssl
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_otp_email(target_email, otp_code):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("[ERROR] Email credentials not found in env. Printing OTP to console instead.")
        print(f"\n[BACKUP MOCK EMAIL] OTP for {target_email}: {otp_code}\n")
        return False

    msg = EmailMessage()
    msg.set_content(f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #10b981; margin: 0;">Finance AI Advisor</h1>
                <p style="color: #64748b; font-size: 14px;">Your secure access code</p>
            </div>
            <div style="background: #f8fafc; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0;">
                <h2 style="font-size: 32px; letter-spacing: 8px; color: #1e293b; margin: 0;">{otp_code}</h2>
            </div>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                Namaste! 🙏<br><br>
                Please use the code above to access your account. This code is valid for single-use only.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                If you did not request this code, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """, subtype='html')

    msg['Subject'] = 'Your Finance AI Verification Code'
    msg['From'] = f"Finance AI <{SMTP_EMAIL}>"
    msg['To'] = target_email

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send email: {str(e)}")
        print(f"\n[BACKUP MOCK EMAIL] OTP for {target_email}: {otp_code}\n")
        return False

def send_welcome_email(target_email, username):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("[ERROR] Email credentials not found in env.")
        print(f"\n[BACKUP MOCK EMAIL] Welcome email to {target_email}\n")
        return False

    msg = EmailMessage()
    msg.set_content(f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #10b981; margin: 0;">Welcome to FinAdvisor! 🎉</h1>
            </div>
            <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                Namaste {username}! 🙏<br><br>
                Your account on FinAdvisor has been successfully created. We are excited to help you on your financial journey.
                <br><br>
                For best results, try asking our AI questions about your taxes, wealth planning, or daily finances!
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                Powered by Finance AI Advisor
            </p>
        </div>
    </body>
    </html>
    """, subtype='html')

    msg['Subject'] = 'Welcome to FinAdvisor!'
    msg['From'] = f"Finance AI <{SMTP_EMAIL}>"
    msg['To'] = target_email

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send welcome email: {str(e)}")
        return False

def send_sms_notification(mobile_number, message):
    """
    Mock function for sending SMS. 
    You need to integrate an SMS provider like Twilio, AWS SNS, or MSG91 here.
    """
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

    if not mobile_number:
        return False

    print(f"\n📱 [SMS NOTIFICATION TO {mobile_number}] => {message}\n")

    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        try:
            from twilio.rest import Client
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=mobile_number
            )
            return True
        except Exception as e:
            print(f"[ERROR] Failed to send SMS via Twilio: {str(e)}")
            return False
    return True

