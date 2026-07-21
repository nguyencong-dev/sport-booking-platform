from fastapi import FastAPI

from app.api.documents import router as documents_router
from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
)


app.include_router(
    documents_router
)