from services.gs_parser import get_sheet_data, update_sheet_data
from fastapi import APIRouter, Request, Response, status

from services.bot_config import ALLOWED_IDS

router = APIRouter()

async def get_data():
    new_data = get_sheet_data()
    return new_data

@router.post("/")
async def user_get(request: Request):
    data = await request.json()
    can_add = False
    user_id = str(data.get("user_id"))
    if user_id in ALLOWED_IDS.values():
        if user_id == ALLOWED_IDS["TIMUR AKHMEDOV"] or user_id == ALLOWED_IDS["VLADIMIR OGULO"]:
            can_add = True
        return await get_data(), can_add
    return Response(status_code=status.HTTP_403_FORBIDDEN)

@router.post("/update-gs")
async def update_sheet(request: Request):
    new_data = await request.json()

    user_info = new_data.pop("userInfo")
    update_sheet_data(new_data, user_info)

    return "OK"