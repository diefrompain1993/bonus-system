from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import asyncio

router_public = APIRouter()

class Attendance(BaseModel):
    telegram_id: str
    name: str
    telegram_nickname: str
    selected_object: str

# Google Sheets отключено
gc = None
sheet = None
logs_sheet = None
object_list = None
montazh_list = None
users_sheet = None

@router_public.post("/attendance")
async def attendance(data: Attendance):
    # Эмуляция успешной записи без Google Sheets
    print(f"[MOCK] Attendance received: {data.name} - {data.selected_object}")
    return {
        "status": "ok",
        "mock": True,
        "message": "Google Sheets отключены, но данные обработаны локально."
    }
