from typing import Annotated

import httpx
from fastapi import (
    Depends,
    HTTPException,
    status,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from app.core.config import settings
from app.schemas.auth import CurrentUser

bearer_scheme = HTTPBearer(
    auto_error=False,
)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chưa cung cấp access token",
        )

    token = credentials.credentials

    try:
        response = httpx.get(
            (f"{settings.fieldmate_api_base_url.rstrip('/')}" "/api/secure/users/me"),
            headers={
                "Authorization": f"Bearer {token}",
            },
            timeout=settings.fieldmate_api_timeout_seconds,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Không thể kết nối FieldMate backend",
        ) from exc

    if response.status_code == status.HTTP_401_UNAUTHORIZED:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token không hợp lệ hoặc đã hết hạn",
        )

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="FieldMate backend trả về lỗi",
        )

    user = CurrentUser.model_validate(response.json())

    if not user.enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hóa",
        )

    return user


def require_admin(
    current_user: Annotated[
        CurrentUser,
        Depends(get_current_user),
    ],
) -> CurrentUser:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ ADMIN được phép cung cấp dữ liệu cho AI",
        )

    return current_user
