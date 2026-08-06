import json
from dataclasses import dataclass
from datetime import date
from typing import Any
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from app.core.config import settings
from app.models.enums import MessageRole
from app.models.message import Message
from app.prompts.chat_prompt import SYSTEM_PROMPT
from app.schemas.retrieval import RetrievedChunkResponse
from app.tools.chat_tools import ChatToolFactory

class ChatAgentError(RuntimeError):
    pass

@dataclass(frozen=True, slots=True)
class ChatAgentResult:
    answer: str
    used_chunks: list[RetrievedChunkResponse]

class ChatAgent:
    def __init__(self, model: ChatOpenAI | None = None, max_iterations: int = 6) -> None:
        if max_iterations <= 0:
            raise ValueError("max_iterations phải lớn hơn 0")

        self.model = model or ChatOpenAI(api_key=settings.openai_api_key.get_secret_value(), model=settings.openai_chat_model, temperature=0)
        self.max_iterations = max_iterations

    async def run(self, *, question: str, history: list[Message] | None = None) -> ChatAgentResult:
        cleaned_question = " ".join(question.split())

        if not cleaned_question:
            raise ChatAgentError("Câu hỏi không được để trống")

        tool_factory = ChatToolFactory()
        tools = tool_factory.build()
        tools_by_name = {selected_tool.name: selected_tool for selected_tool in tools}
        model_with_tools = self.model.bind_tools(tools)
        messages = self._build_messages(question=cleaned_question, history=history or [])

        for _ in range(self.max_iterations):
            response = await model_with_tools.ainvoke(messages)
            messages.append(response)

            if not response.tool_calls:
                answer = self._extract_answer(response)

                if not answer:
                    raise ChatAgentError("AI không trả về nội dung")

                return ChatAgentResult(answer=answer, used_chunks=tool_factory.used_chunks)

            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                selected_tool = tools_by_name.get(tool_name)

                if selected_tool is None:
                    tool_result = json.dumps({"error": f"Không tồn tại công cụ '{tool_name}'"}, ensure_ascii=False)
                    messages.append(ToolMessage(content=tool_result, tool_call_id=tool_call["id"], status="error"))
                    continue

                try:
                    tool_result = await selected_tool.ainvoke(tool_call["args"])
                    messages.append(ToolMessage(content=self._serialize_tool_result(tool_result), tool_call_id=tool_call["id"], status="success"))
                except Exception as exc:
                    tool_result = json.dumps({"error": str(exc)}, ensure_ascii=False)
                    messages.append(ToolMessage(content=tool_result, tool_call_id=tool_call["id"], status="error"))

        raise ChatAgentError("AI đã vượt quá số lần gọi công cụ cho phép")

    def _build_messages(self, *, question: str, history: list[Message]) -> list[BaseMessage]:
        current_system_prompt = f"{SYSTEM_PROMPT}\n\nNgày hiện tại của hệ thống là {date.today().isoformat()}."
        messages: list[BaseMessage] = [SystemMessage(content=current_system_prompt)]

        for message in history:
            if message.role == MessageRole.USER:
                messages.append(HumanMessage(content=message.content))
            elif message.role == MessageRole.ASSISTANT:
                messages.append(AIMessage(content=message.content))

        messages.append(HumanMessage(content=question))
        return messages

    @staticmethod
    def _serialize_tool_result(result: Any) -> str:
        if isinstance(result, str):
            return result

        return json.dumps(result, ensure_ascii=False, default=str)

    @staticmethod
    def _extract_answer(message: AIMessage) -> str:
        if isinstance(message.content, str):
            return message.content.strip()

        contents: list[str] = []

        for block in message.content:
            if isinstance(block, str):
                contents.append(block)
            elif isinstance(block, dict):
                text = block.get("text")

                if isinstance(text, str):
                    contents.append(text)

        return "\n".join(contents).strip()

chat_agent = ChatAgent()