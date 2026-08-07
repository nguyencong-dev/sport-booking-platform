from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.agents.chat_agent import ChatAgentError
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatServiceError, ConversationNotFoundError, chat_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def send_chat_message(request: ChatRequest, db: Annotated[Session, Depends(get_db)], 
                            current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> ChatResponse:
    try:
        return await chat_service.send_message(db, current_user=current_user, request=request)
    except ConversationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ChatServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except ChatAgentError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc