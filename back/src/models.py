from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base # Перед ревизией нужно изменить на src.database

import enum


class UserRole(enum.Enum):
    BUSINESS_CENTER = "BUSINESS_CENTER"
    CENTRAL_OFFICE = "CENTRAL_OFFICE"
    ENGINEER = "ENGINEER"
    ADMIN = "ADMIN"


class TicketStatus(enum.Enum):
    NEW = "Новая"
    IN_PROGRESS = "В работе"
    ON_HOLD = "На паузе"
    COMPLETED = "Завершена"


class WorkType(enum.Enum):
    EMERGENCY = "Аварийная"
    COMMON = "Обычная"
    EXTRA = "Доп. работы"
    TECH_SERVICE = "Тех. обслуживание"


class BaseModel(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)


class User(BaseModel):
    __tablename__ = 'users'

    name = Column(String(100), nullable=False)
    login = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone_number = Column(String(15), nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    job_post = Column(String(50), nullable=True)
    archived = Column(Boolean, default=False, nullable=True)


    business_center_id = Column(Integer, ForeignKey('business_centers.id'), nullable=True)

    assigned_tickets = relationship('Ticket', back_populates='assigned_engineer', lazy='select')
    comments = relationship('Comment', back_populates='author', lazy='select')
    business_center = relationship('BusinessCenter', back_populates='users', lazy='joined')


class BusinessCenter(BaseModel):
    __tablename__ = 'business_centers'

    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    archived = Column(Boolean, default=False, nullable=True)


    users = relationship("User", back_populates="business_center", lazy='select')
    tickets = relationship('Ticket', back_populates='business_center', lazy='select')


class CentralOffice(BaseModel):
    __tablename__ = 'central_offices'

    name = Column(String(100), nullable=False)



class Ticket(BaseModel):
    __tablename__ = 'tickets'

    created_at = Column(DateTime(timezone=True), default=func.now())

    system = Column(String(100), nullable=False)
    work_type = Column(Enum(WorkType), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.NEW, nullable=False)

    engineer_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    assigned_engineer = relationship('User', back_populates='assigned_tickets', lazy='joined')

    business_center_id = Column(Integer, ForeignKey('business_centers.id'), nullable=True)
    business_center = relationship("BusinessCenter", back_populates="tickets", lazy='joined')
    contact_name = Column(String(100), nullable=False)

    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan", lazy='select')

    report_system = Column(String(100), nullable=True)
    report_summary = Column(Text, nullable=True)
    report_links = Column(Text, nullable=True)
    google_sheets_row_id = Column(Integer, nullable=True)

class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=func.now())

    text = Column(Text, nullable=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'), nullable=False)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    ticket = relationship('Ticket', back_populates='comments', lazy='joined')
    author = relationship('User', back_populates='comments', lazy='joined')

    images = relationship('CommentImage', back_populates='comment', cascade="all, delete-orphan", lazy='select')
    files = relationship('CommentFile', back_populates='comment', cascade="all, delete-orphan", lazy='select')


class CommentImage(Base):
    __tablename__ = 'comment_images'

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(255), nullable=False)
    comment_id = Column(Integer, ForeignKey('comments.id'), nullable=False)

    comment = relationship('Comment', back_populates='images', lazy='joined')


class CommentFile(Base):
    __tablename__ = 'comment_files'

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(255), nullable=False)
    comment_id = Column(Integer, ForeignKey('comments.id'), nullable=False)

    # Здесь можно добавить, например, filename, size, content_type и т.д.
    filename = Column(String(255), nullable=True)
    # size = Column(Integer, nullable=True)

    comment = relationship('Comment', back_populates='files', lazy='joined')