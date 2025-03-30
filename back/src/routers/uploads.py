from fastapi import APIRouter, UploadFile, HTTPException, Depends, Body
# from google.oauth2 import service_account
# from googleapiclient.discovery import build
# from googleapiclient.http import MediaIoBaseUpload
from typing import Optional
# import io

from sqlalchemy.orm import Session
from schemas import TicketOut
from database import get_db
from dependencies import get_current_user
from models import Ticket, UserRole

router = APIRouter()

# SCOPES = [...]
# FOLDER_ID = "1dW_5tMlf_q8wtUjk77KrSu2Qs7b8NGmN"
# SPREADSHEET_ID = "1XiwUzCTKFz3ydI03z9-9auHaCNGypsAQwqTwZPLP9os"
# SHEET_NAME = "Лист1"

# creds = service_account.Credentials.from_service_account_file(
#     'smk-main-bd51ad6c1217.json', scopes=SCOPES
# )

@router.post("/upload-to-drive")
async def upload_to_drive(file: UploadFile):
    """
    Заглушка: файл не загружается, но можно эмулировать возврат ссылки.
    """
    return {"url": f"https://example.com/fake-drive-url/{file.filename}"}


@router.post("/{ticket_id}/report", response_model=TicketOut)
def write_ticket_report(
    ticket_id: int,
    report_system: Optional[str] = Body(None),
    report_summary: Optional[str] = Body(None),
    report_links: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Доступ запрещён")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.report_system = report_system
    ticket.report_summary = report_summary
    ticket.report_links = report_links
    db.commit()
    db.refresh(ticket)

    # Google Sheets отключено, ничего не синхронизируем

    return ticket
