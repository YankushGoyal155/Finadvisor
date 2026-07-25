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
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 30px; margin: 0;">
        <div style="max-width: 520px; margin: auto; background: linear-gradient(145deg, #1e293b, #1a2332); padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 16px; display: inline-flex; justify-content: center; align-items: center; font-size: 28px; color: white; font-weight: 800; margin-bottom: 12px;">₹</div>
                <h1 style="color: #f1f5f9; margin: 8px 0 0 0; font-size: 24px;">Welcome to FinAdvisor! 🎉</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Your AI-Powered Financial Companion</p>
            </div>

            <!-- Greeting -->
            <div style="background: rgba(16, 185, 129, 0.08); border-radius: 14px; padding: 24px; border: 1px solid rgba(16, 185, 129, 0.15); margin-bottom: 24px;">
                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.7; margin: 0;">
                    Namaste <strong style="color: #10b981;">{username}</strong>! 🙏<br><br>
                    Your account has been successfully created. We're thrilled to have you on board — let's start your journey to financial freedom!
                </p>
            </div>

            <!-- Features -->
            <div style="margin-bottom: 24px;">
                <p style="color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">What you can do:</p>
                <div style="background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 8px;">
                    <p style="color: #e2e8f0; margin: 0; font-size: 14px;">📊 <strong>Tax Planning</strong> — Optimize your taxes with AY 2026-27 rules</p>
                </div>
                <div style="background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 8px;">
                    <p style="color: #e2e8f0; margin: 0; font-size: 14px;">🤖 <strong>AI Chat</strong> — Get personalized financial advice instantly</p>
                </div>
                <div style="background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="color: #e2e8f0; margin: 0; font-size: 14px;">📈 <strong>Portfolio Tracking</strong> — Monitor mutual funds & investments</p>
                </div>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
            <p style="color: #475569; font-size: 11px; text-align: center; margin: 0; line-height: 1.6;">
                © 2026 FinAdvisor — Your AI-Powered Financial Companion
            </p>
        </div>
    </body>
    </html>
    """, subtype='html')

    msg['Subject'] = '🎉 Welcome to FinAdvisor — Your Financial Journey Starts Now!'
    msg['From'] = f"FinAdvisor <{SMTP_EMAIL}>"
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

def send_signin_email(target_email, username):
    """Send a sign-in notification email when a user logs in."""
    from datetime import datetime, timezone, timedelta
    ist = timezone(timedelta(hours=5, minutes=30))
    login_time = datetime.now(ist).strftime("%d %b %Y, %I:%M %p IST")

    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("[INFO] Email credentials not configured. Skipping sign-in notification.")
        print(f"\n[MOCK SIGN-IN EMAIL] {username} ({target_email}) signed in at {login_time}\n")
        return False

    msg = EmailMessage()
    msg.set_content(f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 30px; margin: 0;">
        <div style="max-width: 520px; margin: auto; background: linear-gradient(145deg, #1e293b, #1a2332); padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 16px; display: inline-flex; justify-content: center; align-items: center; font-size: 28px; color: white; font-weight: 800; margin-bottom: 12px;">₹</div>
                <h1 style="color: #f1f5f9; margin: 8px 0 0 0; font-size: 22px;">Sign-In Detected</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">FinAdvisor Security Alert</p>
            </div>

            <!-- Main Content -->
            <div style="background: rgba(15, 23, 42, 0.6); border-radius: 14px; padding: 24px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 24px;">
                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.7; margin: 0;">
                    Namaste <strong style="color: #10b981;">{username}</strong>! 🙏<br><br>
                    We noticed a successful sign-in to your FinAdvisor account.
                </p>
            </div>

            <!-- Login Details Card -->
            <div style="background: rgba(16, 185, 129, 0.08); border-radius: 14px; padding: 20px; border: 1px solid rgba(16, 185, 129, 0.15); margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #94a3b8; font-size: 13px; padding: 6px 0;">📧 Account</td>
                        <td style="color: #e2e8f0; font-size: 13px; padding: 6px 0; text-align: right; font-weight: 600;">{target_email}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8; font-size: 13px; padding: 6px 0;">🕐 Time</td>
                        <td style="color: #e2e8f0; font-size: 13px; padding: 6px 0; text-align: right; font-weight: 600;">{login_time}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8; font-size: 13px; padding: 6px 0;">✅ Status</td>
                        <td style="color: #10b981; font-size: 13px; padding: 6px 0; text-align: right; font-weight: 700;">Successful</td>
                    </tr>
                </table>
            </div>

            <!-- Security Warning -->
            <div style="background: rgba(234, 179, 8, 0.08); border-radius: 12px; padding: 16px; border: 1px solid rgba(234, 179, 8, 0.15); margin-bottom: 20px;">
                <p style="color: #facc15; font-size: 13px; margin: 0; line-height: 1.6;">
                    ⚠️ <strong>Not you?</strong> If you did not sign in, please change your password immediately and contact support.
                </p>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
            <p style="color: #475569; font-size: 11px; text-align: center; margin: 0; line-height: 1.6;">
                This is an automated security notification from FinAdvisor.<br>
                © 2026 FinAdvisor — Your AI-Powered Financial Companion
            </p>
        </div>
    </body>
    </html>
    """, subtype='html')

    msg['Subject'] = f'🔐 New Sign-In to your FinAdvisor Account'
    msg['From'] = f"FinAdvisor Security <{SMTP_EMAIL}>"
    msg['To'] = target_email

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"[OK] Sign-in notification sent to {target_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send sign-in email: {str(e)}")
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

