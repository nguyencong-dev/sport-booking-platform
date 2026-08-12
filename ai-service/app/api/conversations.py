from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.chat import ConversationListItemResponse, ConversationMessageResponse
from app.services.chat_service import chat_service, ConversationNotFoundError

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])

@router.get("", response_model=list[ConversationListItemResponse], status_code=status.HTTP_200_OK)
def get_conversations(db: Annotated[Session, Depends(get_db)], 
                      current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> list[ConversationListItemResponse]:
    return chat_service.get_conversations(db, current_user)

@router.get("/{id}/messages", response_model=list[ConversationMessageResponse], status_code=status.HTTP_200_OK)
def get_conversation_messages(id: Annotated[int, Path(gt=0)], db: Annotated[Session, Depends(get_db)], current_user: Annotated[CurrentUser, Depends(get_current_user)]) -> list[ConversationMessageResponse]:
    try:
        return chat_service.get_conversation_messages(db, current_user, id)
    except ConversationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc