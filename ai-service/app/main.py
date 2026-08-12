from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from app.clients.fieldmate_client import fieldmate_client
from app.api.conversations import router as conversations_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        await fieldmate_client.close()

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(conversations_router)