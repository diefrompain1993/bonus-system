from typing import List
from fastapi import Depends, HTTPException
import models
from dependencies import get_current_user

def role_required(allowed_roles: List[models.UserRole]):
    def decorator(current_user: models.User = Depends(get_current_user)):
        if current_user.role in allowed_roles or current_user.role == models.UserRole.ADMIN:
            return current_user
        raise HTTPException(status_code=403, detail="Недостаточно прав доступа")
    return decorator