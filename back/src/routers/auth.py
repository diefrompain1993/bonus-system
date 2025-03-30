from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from dependencies import get_current_user

router = APIRouter()

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="https://sibeeria.ru/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, password_hash):
    return pwd_context.verify(plain_password, password_hash)

def authenticate_user(db, login: str, password: str):
    user = db.query(models.User).filter(models.User.login == login).first()
    if user and verify_password(password, user.password_hash):
        return user
    return False

def create_access_token(data: dict = None):
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login")
def login(user: schemas.UserLoginSchema, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.login, user.password)
    if not db_user:
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")
    access_token = create_access_token(
        data={"sub": db_user.login, "role": db_user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserSchema)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user