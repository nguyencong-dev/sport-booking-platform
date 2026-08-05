from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.documents import router as documents_router
from app.clients.fieldmate_client import fieldmate_client
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await fieldmate_client.close()

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(documents_router)