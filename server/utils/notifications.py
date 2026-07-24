import logging

logger = logging.getLogger("notifications")

# For testing purposes, we can store sent notifications in memory
sent_notifications = []


def clear_notifications():
    sent_notifications.clear()


def send_sms(phone_number: str, message: str):
    logger.info(f"Sending SMS to {phone_number}: {message}")
    sent_notifications.append({"type": "sms", "to": phone_number, "message": message})


def send_email(email: str, subject: str, body: str):
    logger.info(f"Sending Email to {email} | Subject: {subject} | Body: {body}")
    sent_notifications.append(
        {"type": "email", "to": email, "subject": subject, "body": body}
    )


def notify_lockout(email: str, phone_number: str | None, username: str):
    subject = "Security Alert: Account Locked"
    body = f"Hello {username}, your account has been temporarily locked due to repeated failed login or OTP attempts. It will be unlocked in 30 minutes."
    send_email(email, subject, body)
    if phone_number:
        send_sms(
            phone_number,
            "Security Alert: Your ApexSecure Bank account has been locked for 30 minutes.",
        )


def notify_new_session(
    email: str,
    phone_number: str | None,
    username: str,
    device_info: str,
    ip_address: str,
):
    subject = "Security Alert: New Login Session"
    body = f"Hello {username}, a new login session was established on device '{device_info}' from IP address {ip_address}."
    send_email(email, subject, body)
    if phone_number:
        send_sms(
            phone_number,
            f"Security Alert: New login to your ApexSecure Bank account from {ip_address}.",
        )
