from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.clients.fieldmate_client import FieldMateClientError, fieldmate_client
from app.schemas.auth import CurrentUser

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Chưa cung cấp access token")

    try:
        user = await fieldmate_client.get_current_user(credentials.credentials)
    except FieldMateClientError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    if not user.enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị vô hiệu hóa")

    return user

def require_admin(current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ ADMIN được phép cung cấp dữ liệu cho AI")

    return current_user

def require_customer(current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    if current_user.role != "CUSTOMER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ CUSTOMER được phép sử dụng trợ lý AI")

    return current_user