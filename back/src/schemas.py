# backend/src/schemas.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


# Определение Enums
class UserRoleEnum(str, Enum):
    BUSINESS_CENTER = "BUSINESS_CENTER"
    CENTRAL_OFFICE = "CENTRAL_OFFICE"
    ENGINEER = "ENGINEER"
    ADMIN = "ADMIN"


class TicketStatusEnum(str, Enum):
    NEW = "Новая"
    IN_PROGRESS = "В работе"
    ON_HOLD = "На паузе"
    COMPLETED = "Завершена"


class WorkTypeEnum(str, Enum):
    EMERGENCY = "Аварийная"
    COMMON = "Обычная"
    EXTRA = "Доп. работы"
    TECH_SERVICE = "Тех. обслуживание"

class BusinessCenterSchema(BaseModel):
    id: int
    name: str = Field(..., max_length=100, description="Название бизнес-центра")
    address: Optional[str] = Field(None, max_length=255, description="Адрес бизнес-центра")
    archived: bool = Field(default=False, description="Архивирован")

    class Config:
        from_attributes = True


# Пользовательская схема
class UserSchema(BaseModel):
    id: int
    login: str = Field(..., max_length=50, description="Уникальный логин пользователя")
    name: str = Field(..., max_length=100, description="Имя пользователя")
    email: Optional[EmailStr] = Field(None, max_length=100, description="Электронная почта пользователя")
    role: UserRoleEnum
    phone_number: Optional[str] = Field(None, max_length=15, description="Номер телефона пользователя")
    job_post: Optional[str] = Field(None, max_length=50, description="Должность пользователя")
    archived: bool = Field(default=False, description="Архивирован ли")
    business_center: Optional[BusinessCenterSchema] = None

    class Config:
        from_attributes = True


class UserCreateSchema(BaseModel):
    login: str = Field(..., max_length=50)
    name: str = Field(..., max_length=100)
    email: Optional[EmailStr] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=25, description="Номер телефона пользователя")
    role: UserRoleEnum
    password: str = Field(..., description="Пароль для нового пользователя")
    job_post: Optional[str] = None
    business_center_id: Optional[int] = None

class UserUpdateSchema(BaseModel):
    login: str = Field(..., max_length=50)
    name: str = Field(..., max_length=100)
    email: Optional[EmailStr] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=25, description="Номер телефона пользователя")
    role: UserRoleEnum
    job_post: Optional[str] = None
    business_center_id: Optional[int] = None
    password: Optional[str] = Field(None, description="Новый пароль")


class UserLoginSchema(BaseModel):
    login: str
    password: str




class CentralOfficeSchema(BaseModel):
    id: int
    name: str = Field(..., max_length=100, description="Название центрального офиса")

    class Config:
        from_attributes = True



class CommentImageSchema(BaseModel):
    id: int
    url: str = Field(..., max_length=255, description="URL изображения")

    class Config:
        from_attributes = True

class CommentFileSchema(BaseModel):
    id: int
    url: str = Field(..., max_length=255, description="URL файла")
    filename: Optional[str] = None

    class Config:
        from_attributes = True


class CommentSchema(BaseModel):
    id: int
    text: Optional[str] = None
    timestamp: datetime
    author: UserSchema
    images: List[CommentImageSchema] = []
    files: List[CommentFileSchema] = []

    class Config:
        from_attributes = True

# Схемы для заявок
class TicketSchema(BaseModel):
    id: int
    system: str = Field(..., max_length=50, description="Название системы")
    work_type: WorkTypeEnum
    description: str = Field(..., description="Описание проблемы или запроса")
    status: TicketStatusEnum
    business_center: Optional[BusinessCenterSchema] = None
    contact_name: str = Field(..., max_length=100, description="ФИО автора заявки (БЦ)")
    assigned_engineer: Optional[UserSchema] = None
    comments: List[CommentSchema] = []

    created_at: datetime

    report_system: Optional[str] = Field(default=None, max_length=100, description="Например, 'Неисправность'")
    report_summary: Optional[str] = Field(default=None, description="Выполненные работы/итог отчёта")
    report_links: Optional[str] = Field(default=None, description="Ссылки на фото")
    google_sheets_row_id: Optional[int] = Field(default=None, description="ID строки в Google Sheets")

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.astimezone().isoformat()
            }


class TicketCreateSchema(BaseModel):
    contact_name: str = Field(..., max_length=200, description="Полное имя клиента")
    system: str = Field(..., max_length=100, description="Название системы")
    work_type: WorkTypeEnum
    description: str = Field(..., description="Описание проблемы или запроса")
    business_center_id: Optional[int] = Field(None, description="ID бизнес-центра")
    engineer_id: Optional[int] = Field(None, description="ID инженера")


class StatusUpdateRequestSchema(BaseModel):
    status: TicketStatusEnum


# Схемы для аутентификации и токенов
class TokenSchema(BaseModel):
    access_token: str
    token_type: str


class TokenDataSchema(BaseModel):
    user_id: Optional[int] = None


# Прочие схемы
class AssignEngineerSchema(BaseModel):
    engineer_id: Optional[int] = Field(..., description="ID инженера для назначения")


class MessageSchema(BaseModel):
    message: str = Field(..., description="Сообщение")

class TicketOut(BaseModel):
    id: int
    report_system: Optional[str] = Field(default=None, max_length=100, description="Например, 'Неисправность'")
    report_summary: Optional[str] = Field(default=None, description="Выполненные работы/итог отчёта")
    report_links: Optional[str] = Field(default=None, description="Ссылки на фото")
    google_sheets_row_id: Optional[int] = Field(default=None, description="ID строки в Google Sheets")

    class Config:
        orm_mode = True

class BusinessCenterBaseSchema(BaseModel):
    """
    Общие поля для BusinessCenter (используем в Create/Update).
    """
    name: str
    address: Optional[str] = None

class BusinessCenterCreateSchema(BusinessCenterBaseSchema):
    """
    Схема для создания бизнес-центра (POST).
    Никаких дополнительных полей не нужно —
    мы уже унаследовали 'name' и 'address' из базового класса.
    """
    pass

class BusinessCenterUpdateSchema(BaseModel):
    """
    Схема для обновления бизнес-центра (PUT).
    Если делаете полный PUT, можно оставить поля обязательными (как в Base).
    Если хотите частичный PATCH, сделайте поля необязательными.
    """
    name: Optional[str] = None
    address: Optional[str] = None