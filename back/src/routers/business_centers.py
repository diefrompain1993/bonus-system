from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models import BusinessCenter
from schemas import (
    BusinessCenterSchema,
    BusinessCenterCreateSchema,
    BusinessCenterUpdateSchema,
)
from database import get_db

router = APIRouter()


@router.get("/", response_model=List[BusinessCenterSchema])
def get_business_centers(db: Session = Depends(get_db)):
    """
    Получить список всех бизнес-центров, не в архиве
    """
    return db.query(BusinessCenter).all()

@router.get("/all", response_model=List[BusinessCenterSchema])
def get_business_centers(db: Session = Depends(get_db)):
    """
    Получить список всех бизнес-центров
    """
    return db.query(BusinessCenter).filter(BusinessCenter.archived is False).all()


@router.post("/", response_model=BusinessCenterSchema, status_code=status.HTTP_201_CREATED)
def create_business_center(
    bc_data: BusinessCenterCreateSchema,
    db: Session = Depends(get_db),
):
    """
    Создать новый бизнес-центр.
    """
    new_bc = BusinessCenter(
        name=bc_data.name,
        address=bc_data.address,
        archived=False,
    )
    db.add(new_bc)
    db.commit()
    db.refresh(new_bc)

    return new_bc


@router.get("/{bc_id}", response_model=BusinessCenterSchema)
def get_business_center(bc_id: int, db: Session = Depends(get_db)):
    """
    Получить бизнес-центр по ID.
    """
    bc = db.query(BusinessCenter).filter(BusinessCenter.id == bc_id).first()
    if not bc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бизнес-центр не найден",
        )
    return bc


@router.put("/{bc_id}", response_model=BusinessCenterSchema)
def update_business_center(
    bc_id: int,
    bc_data: BusinessCenterUpdateSchema,
    db: Session = Depends(get_db),
):
    """
    Полностью обновить бизнес-центр (все поля).
    """
    bc = db.query(BusinessCenter).filter(BusinessCenter.id == bc_id).first()

    if not bc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бизнес-центр не найден",
        )

    bc.name = bc_data.name
    bc.address = bc_data.address

    db.commit()
    db.refresh(bc)
    return bc


@router.patch("/{bc_id}/archive", response_model=BusinessCenterSchema)
def archive_business_center(bc_id: int, db: Session = Depends(get_db)):
    """
    Архивировать бизнес-центр.
    """
    bc = db.query(BusinessCenter).filter(BusinessCenter.id == bc_id).first()
    if not bc:
        raise HTTPException(status_code=404, detail="Бизнес-центр не найден")

    bc.archived = True
    db.commit()
    db.refresh(bc)
    return bc


@router.patch("/{bc_id}/unarchive", response_model=BusinessCenterSchema)
def unarchive_business_center(bc_id: int, db: Session = Depends(get_db)):
    """
    Разархивировать бизнес-центр.
    """
    bc = db.query(BusinessCenter).filter(BusinessCenter.id == bc_id).first()
    if not bc:
        raise HTTPException(status_code=404, detail="Бизнес-центр не найден")

    bc.archived = False
    db.commit()
    db.refresh(bc)
    return bc
