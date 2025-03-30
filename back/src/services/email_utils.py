# backend/src/services/email_utils.py

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
import os

class EmailSchema(BaseModel):
    email: EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD'),
    MAIL_FROM = os.getenv('MAIL_FROM'),
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587)),
    MAIL_SERVER = os.getenv('MAIL_SERVER'),
    MAIL_TLS = True,
    MAIL_SSL = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_new_ticket_email(recipient_email: str, ticket_info: dict):
    message = MessageSchema(
        subject = f"Новая заявка #{ticket_info['id']}",
        recipients = [recipient_email],
        body = f"""
        Здравствуйте,

        Вы создали новую заявку #{ticket_info['id']}.

        Система: {ticket_info['system']}
        Приоритет: {ticket_info['priority']}
        Описание: {ticket_info['description']}

        "СМК"
        """,
        subtype = "plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
