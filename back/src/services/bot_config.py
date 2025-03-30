import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher, Router, types
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

ALLOWED_IDS = {
    "TIMUR AKHMEDOV": "5119555661",
    "VLADIMIR OGULO": "107764320",
}

BOT_TOKEN = "8021989897:AAHgk9eihR78HRby6WTj7XSJTGJh6_jHe_M"
CHAT_ID = "5119555661"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
router = Router()
dp.include_router(router)

@dp.message(CommandStart())
async def cmd_start(message: Message):
    user_id = message.from_user.id
    if str(user_id) in ALLOWED_IDS.values():
        markup = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="СМК-склад",
                        web_app=WebAppInfo(url="https://sibeeria.ru/login"),
                    ),
                ]
            ]
        )       
        await message.answer("Для управления складом перейдите по ссылке",
                             reply_markup=markup)

async def send_new_ticket_notification(ticket_id, ticket_info):
    message = f"Новая заявка #{ticket_id}:\nСистема: {ticket_info['system']}\nПриоритет: {ticket_info['priority']}"
    await bot.send_message(chat_id=CHAT_ID, text=message)

def notify_new_ticket(ticket_id, ticket_info):
    asyncio.create_task(send_new_ticket_notification(ticket_id, ticket_info))

async def main() -> None:
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
