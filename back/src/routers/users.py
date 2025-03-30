# backend/src/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from passlib.context import CryptContext

import schemas
from models import User
from database import get_db

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/", response_model=List[schemas.UserSchema])
def get_users(
    role: Optional[str] = None, 
    business_center_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if business_center_id:
        query = query.filter(User.business_center_id == business_center_id)
    
    return query.all()

@router.post("/", response_model=schemas.UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user_data: schemas.UserCreateSchema, db: Session = Depends(get_db)):
    # Проверка логина
    existing = db.query(User).filter(User.login == user_data.login).first()
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Такой логин уже существует"
        )

    # Хешируем пароль
    hashed_password = pwd_context.hash(user_data.password)

    new_user = User(
        name=user_data.name,
        login=user_data.login,
        password_hash=hashed_password,
        email=user_data.email,
        phone_number=user_data.phone_number,
        role=user_data.role,
        job_post=user_data.job_post,
        archived=False,
        business_center_id=user_data.business_center_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=schemas.UserSchema)
def update_user(user_id: int, user_data: schemas.UserUpdateSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.name = user_data.name
    user.login = user_data.login
    user.email = user_data.email
    user.phone_number = user_data.phone_number
    user.role = user_data.role
    user.job_post = user_data.job_post
    user.business_center_id = user_data.business_center_id

    # Если передан новый пароль - хешируем
    if user_data.password:
        user.password_hash = pwd_context.hash(user_data.password)

    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/archive", response_model=schemas.UserSchema)
def archive_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.archived = True
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/unarchive", response_model=schemas.UserSchema)
def archive_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.archived = False
    db.commit()
    db.refresh(user)
    return user