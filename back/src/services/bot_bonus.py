import logging
import sys
import asyncio
from aiogram import Bot, Dispatcher, Router, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

BOT_TOKEN = "7927400639:AAFuo_RYM592ilLkfpdqnfgDFfGgfVuDFU8"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
router = Router()
dp.include_router(router)

@dp.message(Command("start"))
async def start_handler(message: types.Message):
    """
    При нажатии на /start формируем URL, 
    в котором есть параметры user_id, user_name и user_nickname.
    """
    user_id = message.from_user.id
    user_name = message.from_user.first_name  # или message.from_user.full_name
    user_nickname = message.from_user.username if message.from_user.username else ""

    web_app_url = (
        "https://sibeeria.ru/bonus"
        f"?user_id={user_id}"
        f"&user_name={user_name}"
        f"&user_nickname={user_nickname}"
    )

    inline_keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="Открыть смк приложение",
            web_app=WebAppInfo(url=web_app_url)
        )
    ]])

    await message.answer(
        text="Нажмите кнопку для входа в мини-приложение",
        reply_markup=inline_keyboard
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
