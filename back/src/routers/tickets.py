# backend/src/routers/tickets.py
from pydantic import BaseModel
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import models, schemas
from database import get_db
from dependencies import get_current_user
from utils import role_required
from models import UserRole
from datetime import datetime

# from google.oauth2 import service_account
# from googleapiclient.discovery import build
# from googleapiclient.http import MediaIoBaseUpload
# import io
# from services.email_utils import send_new_ticket_email

router = APIRouter()

@router.get("/", response_model=List[schemas.TicketSchema])
def get_tickets(
    businessCenter: Optional[int] = Query(None, alias="businessCenter"),
    dateFrom: Optional[datetime] = Query(None, alias="dateFrom"),
    dateTo: Optional[datetime] = Query(None, alias="dateTo"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Ticket)

    # Фильтрация по диапазону дат
    if dateFrom:
        query = query.filter(models.Ticket.created_at >= dateFrom)
    if dateTo:
        query = query.filter(models.Ticket.created_at <= dateTo)

    # Дополнительная фильтрация на основе роли пользователя
    if current_user.role in [models.UserRole.ADMIN, models.UserRole.CENTRAL_OFFICE, models.UserRole.ENGINEER]:
        # Администратор и центральный офис видят все заявки
        if businessCenter:
            query = query.filter(models.Ticket.business_center_id == businessCenter)
    elif current_user.role == models.UserRole.BUSINESS_CENTER:
        # Пользователь бизнес-центра видит только свои заявки
        if current_user.business_center_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="У пользователя не указан business_center_id."
            )
        query = query.filter(models.Ticket.business_center_id == current_user.business_center_id)
    else:
        # Другие пользователи могут видеть только свои заявки или имеют другие ограничения
        # Настройте по необходимости
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещен")

    try:
        tickets = query.order_by(models.Ticket.created_at.desc()).all()
        return tickets
    except Exception as e:
        # Логируйте ошибку в реальном приложении
        raise HTTPException(status_code=500, detail="Ошибка при получении заявок")

@router.get("/{ticket_id}", response_model=schemas.TicketSchema)
def get_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return ticket

@router.post("/", response_model=schemas.TicketSchema)
def create_ticket(
    ticket: schemas.TicketCreateSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_ticket = models.Ticket(
        contact_name=ticket.contact_name,
        system=ticket.system,
        description=ticket.description,
        status=models.TicketStatus.NEW,
        work_type=ticket.work_type.name,
        business_center_id=ticket.business_center_id
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    # Отправка email уведомления
    # ticket_info = {
    #     'id': db_ticket.id,
    #     'system': db_ticket.system,
    #     'priority': db_ticket.priority,
    #     'description': db_ticket.description
    # }
    # recipient_email = current_user.email  # Предполагается, что в модели User есть поле email
    # background_tasks.add_task(recipient_email, ticket_info) # send_new_ticket_email, 

    return db_ticket

@router.post("/{ticket_id}/assign", response_model=schemas.TicketSchema)
def assign_engineer(
    ticket_id: int, 
    assign_data: schemas.AssignEngineerSchema, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Проверка роли пользователя
    if current_user.role not in [models.UserRole.ENGINEER, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Недостаточно прав для назначения инженера"
        )
    
    # Поиск заявки
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Заявка не найдена"
        )

    # Если в теле запроса пришёл null, сбрасываем engineer_id на NULL
    if assign_data.engineer_id is None:
        ticket.engineer_id = None
        db.commit()
        db.refresh(ticket)
        return ticket

    # Поиск инженера
    engineer = db.query(models.User)\
                 .filter(
                     models.User.id == assign_data.engineer_id, 
                     models.User.role == models.UserRole.ENGINEER
                 )\
                 .first()
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Инженер не найден"
        )
    
    # Назначение инженера
    ticket.engineer_id = engineer.id
    db.commit()
    db.refresh(ticket)
    
    return ticket

# SCOPES = ['https://www.googleapis.com/auth/drive.file']
# FOLDER_ID = "1dW_5tMlf_q8wtUjk77KrSu2Qs7b8NGmN"
# creds = service_account.Credentials.from_service_account_file(
#     'smk-main-bd51ad6c1217.json', scopes=SCOPES)

def upload_file_to_drive(uploaded_file: UploadFile) -> str:
    """
    Загружает один файл в Google Drive, выставляет права "anyone" (reader),
    и возвращает прямую ссылку вида https://drive.google.com/uc?id=...
    """
    try:
        service = build('drive', 'v3', credentials=creds)
        file_metadata = {
            'name': uploaded_file.filename,
            'parents': [FOLDER_ID]
        }
        # Считываем байты из UploadFile и готовим MediaIoBaseUpload
        media = MediaIoBaseUpload(
            io.BytesIO(uploaded_file.file.read()),
            mimetype=uploaded_file.content_type
        )

        # Создаём файл в Google Drive
        result = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()

        file_id = result.get('id')
        # Выставляем права доступа "anyone -> reader"
        service.permissions().create(
            fileId=file_id,
            body={'type': 'anyone', 'role': 'reader'}
        ).execute()

        # Формируем URL для скачивания/просмотра
        file_url = f"https://drive.google.com/uc?id={file_id}"
        return file_url

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {e}")


@router.post("/{ticket_id}/comments", response_model=schemas.CommentSchema)
async def add_comment(
    ticket_id: int,
    text: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),  # <-- Если нажали «Прикрепить изображение»
    files: Optional[List[UploadFile]] = File(None),   # <-- Если нажали «Прикрепить файл»
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Добавить комментарий к заявке (ticket).
    Параметры:
      - text: текст комментария (FormData).
      - images: список прикреплённых "картинок" (File()).
      - files: список прикреплённых "документов" (File()).

    Возвращает созданный комментарий.
    """

    # Проверяем, существует ли заявка
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    # Создаём комментарий в БД
    comment = models.Comment(
        text=text,
        ticket_id=ticket.id,
        author_id=current_user.id,
        timestamp=datetime.utcnow(),  # или func.now()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Обрабатываем список images
    if images:
        for img in images:
            file_url = upload_file_to_drive(img)  # Ваша функция загрузки в Drive
            new_image = models.CommentImage(
                url=file_url,
                comment_id=comment.id
            )
            db.add(new_image)

    # Обрабатываем список files
    if files:
        for f in files:
            file_url = upload_file_to_drive(f)
            new_file = models.CommentFile(
                url=file_url,
                comment_id=comment.id,
                filename=f.filename 
            )
            db.add(new_file)

    db.commit()
    db.refresh(comment)

    return comment

class StatusUpdateRequest(BaseModel):
    status: schemas.TicketStatusEnum

@router.put("/{ticket_id}/status", response_model=schemas.TicketSchema)
async def update_ticket_status(
    ticket_id: int,
    request: schemas.StatusUpdateRequestSchema,  # Pydantic модель, содержащая статус
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Проверка прав пользователя
    if current_user.role not in [models.UserRole.ENGINEER, models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Недостаточно прав для изменения статуса")

    # Поиск тикета
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    # Обновление статуса тикета с использованием имени перечисления
    ticket.status = request.status.name  # Используем имя перечисления вместо значения
    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/{comment_id}", response_model=schemas.MessageSchema)
async def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Поиск комментария
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Комментарий не найден")

    # Проверка прав пользователя (только инженер или администратор может удалить комментарий)
    if current_user.role not in [models.UserRole.ENGINEER, models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Недостаточно прав для удаления комментария")

    # Удаление комментария
    db.delete(comment)
    db.commit()
    
    return {"message": "Комментарий удален"}

