from sqlalchemy.orm import Session
from app.agents.chat_agent import ChatAgent, chat_agent
from app.models.conversation import Conversation
from app.models.enums import MessageRole
from app.models.message import Message
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.message_source_repository import MessageSourceRepository
from app.schemas.auth import CurrentUser
from app.schemas.chat import ChatRequest, ChatResponse, ChatSourceResponse

class ChatServiceError(ValueError):
    pass

class ConversationNotFoundError(ChatServiceError):
    pass

class ChatService:
    def __init__(self, agent: ChatAgent | None = None, conversation_repository: ConversationRepository | None = None, message_repository: MessageRepository | None = None, message_source_repository: MessageSourceRepository | None = None, history_limit: int = 10) -> None:
        if history_limit <= 0:
            raise ValueError("history_limit phải lớn hơn 0")
        self.agent = agent or chat_agent
        self.conversation_repository = conversation_repository or ConversationRepository()
        self.message_repository = message_repository or MessageRepository()
        self.message_source_repository = message_source_repository or MessageSourceRepository()
        self.history_limit = history_limit

    async def send_message(self, db: Session, *, current_user: CurrentUser, request: ChatRequest) -> ChatResponse:
        cleaned_message = " ".join(request.message.split())
        if not cleaned_message:
            raise ChatServiceError("Câu hỏi không được để trống")
        try:
            conversation = self._resolve_conversation(db, current_user=current_user, conversation_id=request.conversation_id)
            history = self.message_repository.get_recent_by_conversation_id(db, conversation_id=conversation.id, limit=self.history_limit)
            user_message = self.message_repository.create(db, conversation_id=conversation.id, role=MessageRole.USER, content=cleaned_message)
            agent_result = await self.agent.run(question=cleaned_message, history=history)
            assistant_message = self.message_repository.create(db, conversation_id=conversation.id, role=MessageRole.ASSISTANT, content=agent_result.answer)
            self.message_source_repository.create_many(db, message_id=assistant_message.id, chunks=agent_result.used_chunks)
            self.conversation_repository.touch(conversation)

            sources = [
                ChatSourceResponse(
                    chunk_id=chunk.chunk_id,
                    document_id=chunk.document_id,
                    document_title=chunk.document_title,
                    page_number=chunk.page_number,
                    similarity=chunk.similarity,
                )
                for chunk in agent_result.used_chunks
            ]

            db.commit()

            return ChatResponse(
                conversation_id=conversation.id,
                user_message_id=user_message.id,
                assistant_message_id=assistant_message.id,
                answer=agent_result.answer,
                sources=sources,
            )
        except Exception:
            db.rollback()
            raise

    def _resolve_conversation(self, db: Session, *, current_user: CurrentUser, conversation_id: int | None) -> Conversation:
        user_subject = str(current_user.id)
        if conversation_id is None:
            return self.conversation_repository.create(db, user_subject=user_subject)
        conversation = self.conversation_repository.get_by_id_and_user_subject(db, conversation_id=conversation_id, user_subject=user_subject)
        if conversation is None:
            raise ConversationNotFoundError("Không tìm thấy cuộc hội thoại hoặc bạn không có quyền truy cập")

        return conversation

    def get_conversations(self, db: Session, current_user: CurrentUser) -> list[Conversation]:
        return self.conversation_repository.get_all_by_user_subject(db, str(current_user.id))

    def get_conversation_messages(self, db: Session, current_user: CurrentUser, conversation_id: int) -> list[Message]:
        conversation = self.conversation_repository.get_by_id_and_user_subject(db, conversation_id=conversation_id, user_subject=str(current_user.id))
        if conversation is None:
            raise ConversationNotFoundError("Không tìm thấy cuộc hội thoại hoặc bạn không có quyền truy cập")

        return self.message_repository.get_all_by_conversation_id(db, conversation_id)

chat_service = ChatService()