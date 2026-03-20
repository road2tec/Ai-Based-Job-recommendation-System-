import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def send_otp_email(email_to, otp):
    # Retrieve configuration from environment variables
    mail_server = os.getenv("MAIL_SERVER")
    mail_port = int(os.getenv("MAIL_PORT", 587))
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    mail_from = os.getenv("MAIL_FROM")

    if not all([mail_server, mail_username, mail_password, mail_from]):
        print("Email configuration is incomplete. Skipping email.")
        return False

    try:
        # Create message container
        msg = MIMEMultipart()
        msg['From'] = mail_from
        msg['To'] = email_to
        msg['Subject'] = "Verification OTP - Jobify"

        # Email body
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <h1 style="color: #00B074; text-align: center; font-size: 28px; font-weight: 800; margin-bottom: 20px;">Jobify Verification</h1>
                    <p style="text-align: center; color: #555555; font-size: 16px;">Hello,</p>
                    <p style="text-align: center; color: #555555; font-size: 16px;">Welcome to Jobify! Your verification code is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: 900; background-color: #f0fdf4; color: #00B074; padding: 15px 30px; border-radius: 15px; letter-spacing: 5px; border: 2px dashed #00B074;">
                            {otp}
                        </span>
                    </div>
                    <p style="text-align: center; color: #999999; font-size: 13px; margin-top: 30px;">
                        This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
                    <p style="text-align: center; color: #bbbbbb; font-size: 12px;">
                        &copy; 2026 Jobify. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        # Setup SMTP server connection
        server = smtplib.SMTP(mail_server, mail_port)
        server.starttls()
        server.login(mail_username, mail_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
